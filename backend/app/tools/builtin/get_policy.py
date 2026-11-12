import logging
from typing import Any, Dict

from app.tools.base import BaseTool, ToolResult

logger = logging.getLogger("sentinel.tools.get_policy")


class GetPolicyTool(BaseTool):
    """
    Fetches the security and access policies configured for an organization.
    Requires 'restricted' auth level — only operators and admins can invoke.
    """

    name = "get_policy"
    description = (
        "Retrieve the active security policy configuration for the current organization. "
        "Shows input/output inspection rules, tool authorization settings, and RAG access controls. "
        "Requires operator or admin privileges."
    )
    parameters_schema = {
        "type": "object",
        "properties": {
            "policy_type": {
                "type": "string",
                "description": "Type of policy to retrieve.",
                "enum": ["input", "output", "tool", "rag", "all"],
                "default": "all",
            },
        },
        "required": [],
    }
    auth_level = "restricted"

    async def execute(self, arguments: Dict[str, Any], context: Dict[str, Any]) -> ToolResult:
        policy_type = arguments.get("policy_type", "all")
        org_id = context.get("org_id", "unknown")

        logger.info(f"Fetching policy type='{policy_type}' for org={org_id}")

        # Mock policy data (Phase 3 will read from the policies table)
        policies = {
            "input": {
                "name": "Default Input Guard",
                "type": "input",
                "rules": {
                    "block_prompt_injection": True,
                    "max_input_tokens": 1024,
                    "blocked_patterns": ["ignore previous", "system:", "reveal secret"],
                },
                "enabled": True,
            },
            "output": {
                "name": "PII Anonymizer Output Policy",
                "type": "output",
                "rules": {
                    "mask_pii": True,
                    "pii_entities": ["SSN", "EMAIL", "PHONE", "CREDIT_CARD"],
                    "redaction_marker": "<PII_REDACTED>",
                },
                "enabled": True,
            },
            "tool": {
                "name": "Least Privilege Tool Gate",
                "type": "tool",
                "rules": {
                    "deny_by_default": True,
                    "require_approval_for": ["delete_records", "execute_sql", "send_email"],
                    "auto_allow": ["search_documents", "calculator"],
                },
                "enabled": True,
            },
            "rag": {
                "name": "Tenant Isolation RAG Boundary",
                "type": "rag",
                "rules": {
                    "enforce_tenant_isolation": True,
                    "cross_tenant_access": "strictly_denied",
                    "document_level_acl": True,
                },
                "enabled": True,
            },
        }

        if policy_type == "all":
            result_policies = policies
        elif policy_type in policies:
            result_policies = {policy_type: policies[policy_type]}
        else:
            return ToolResult(
                success=False,
                output="",
                error=f"Unknown policy type: '{policy_type}'. Valid types: input, output, tool, rag, all.",
            )

        output_lines = [f"Active security policies for organization ({org_id}):\n"]
        for ptype, policy in result_policies.items():
            output_lines.append(f"📋 {policy['name']} ({ptype})")
            output_lines.append(f"   Enabled: {policy['enabled']}")
            for rule_key, rule_val in policy["rules"].items():
                output_lines.append(f"   • {rule_key}: {rule_val}")
            output_lines.append("")

        return ToolResult(
            success=True,
            output="\n".join(output_lines),
            metadata={"policies_returned": len(result_policies)},
        )

