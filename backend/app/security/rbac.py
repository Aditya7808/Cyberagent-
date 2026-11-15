from typing import List
from app.models.user import UserRole

ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [
        "*",  # All permissions
        "radar:view",
        "agents:manage",
        "playground:admin",
        "redteam:execute",
        "approvals:resolve",
        "rag:manage",
        "evaluations:run",
        "audit:view_all",
        "audit:export",
        "users:manage",
    ],
    UserRole.ADMIN: [
        "*",
        "radar:view",
        "agents:manage",
        "playground:admin",
        "redteam:execute",
        "approvals:resolve",
        "rag:manage",
        "evaluations:run",
        "audit:view_all",
        "audit:export",
        "users:manage",
    ],
    UserRole.DEVELOPER: [
        "agents:manage",
        "playground:execute",
        "rag:manage",
        "evaluations:run",
        "evaluations:view",
        "redteam:view",
        "audit:read_own",
    ],
    UserRole.OPERATOR: [
        "agents:manage",
        "playground:execute",
        "rag:manage",
        "evaluations:run",
        "evaluations:view",
        "redteam:view",
        "audit:read_own",
    ],
    UserRole.AUDITOR: [
        "radar:view",
        "audit:view_all",
        "audit:export",
        "evaluations:view",
        "documents:read",
        "redteam:view",
    ],
    UserRole.END_USER: [
        "playground:chat",
        "documents:search",
    ],
    UserRole.VIEWER: [
        "playground:chat",
        "documents:search",
    ],
}

CLEARANCE_LEVELS = {
    UserRole.SUPER_ADMIN: "LVL-5 [ROOT]",
    UserRole.ADMIN: "LVL-5 [ROOT]",
    UserRole.DEVELOPER: "LVL-3 [DEV]",
    UserRole.OPERATOR: "LVL-3 [DEV]",
    UserRole.AUDITOR: "LVL-2 [AUDIT]",
    UserRole.END_USER: "LVL-1 [USER]",
    UserRole.VIEWER: "LVL-1 [USER]",
}


def get_role_permissions(role: UserRole) -> List[str]:
    return ROLE_PERMISSIONS.get(role, ["playground:chat"])


def get_clearance_level(role: UserRole) -> str:
    return CLEARANCE_LEVELS.get(role, "LVL-1 [USER]")

