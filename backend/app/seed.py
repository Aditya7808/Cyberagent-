import asyncio
import json
import logging
from pathlib import Path
from sqlalchemy import select
from app.database import AsyncSessionLocal, Base, engine
from app.models.organization import Organization
from app.models.user import User, UserRole
from app.models.document import Document, DocumentChunk, DocumentAccessLevel, DocumentSourceType
from app.models.policy import Policy, PolicyType
from passlib.context import CryptContext

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SEED_DIR = Path(__file__).resolve().parent.parent / "data" / "seed"

TENANTS = [
    {
        "name": "Acme Corporation",
        "slug": "acme-corp",
        "folder": "acme_corp",
        "admin_email": "admin@acmecorp.internal",
        "admin_name": "Sarah Jenkins",
    },
    {
        "name": "Globex Inc",
        "slug": "globex-inc",
        "folder": "globex_inc",
        "admin_email": "admin@globex.internal",
        "admin_name": "Veronica Hastings",
    },
    {
        "name": "Wayne Enterprises",
        "slug": "wayne-enterprises",
        "folder": "wayne_enterprises",
        "admin_email": "admin@waynecorp.internal",
        "admin_name": "Lucius Fox",
    },
]


async def seed_data():
    logger.info("Initializing database schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        for tenant_info in TENANTS:
            # Check or create organization
            res = await session.execute(select(Organization).where(Organization.slug == tenant_info["slug"]))
            org = res.scalars().first()
            if not org:
                org = Organization(name=tenant_info["name"], slug=tenant_info["slug"])
                session.add(org)
                await session.flush()
                logger.info(f"Created Organization: {org.name}")

            # Check or create admin user
            user_res = await session.execute(select(User).where(User.email == tenant_info["admin_email"]))
            user = user_res.scalars().first()
            if not user:
                user = User(
                    org_id=org.id,
                    email=tenant_info["admin_email"],
                    full_name=tenant_info["admin_name"],
                    hashed_password=pwd_context.hash("Password123!"),
                    role=UserRole.ADMIN,
                )
                session.add(user)
                logger.info(f"Created Admin User: {user.email}")

            # Seed Documents
            folder_path = SEED_DIR / tenant_info["folder"]
            if folder_path.exists():
                for doc_file in folder_path.iterdir():
                    if doc_file.is_file():
                        access_level = DocumentAccessLevel.INTERNAL
                        if "hr_policy" in doc_file.name or "financial" in doc_file.name:
                            access_level = DocumentAccessLevel.CONFIDENTIAL
                        elif "employee_records" in doc_file.name:
                            access_level = DocumentAccessLevel.RESTRICTED
                        elif "company_overview" in doc_file.name:
                            access_level = DocumentAccessLevel.PUBLIC

                        existing_doc = await session.execute(
                            select(Document).where(Document.org_id == org.id, Document.title == doc_file.stem)
                        )
                        if not existing_doc.scalars().first():
                            content = doc_file.read_text(encoding="utf-8")
                            doc = Document(
                                org_id=org.id,
                                title=doc_file.stem,
                                source_type=DocumentSourceType.UPLOAD,
                                access_level=access_level,
                                file_type=doc_file.suffix.replace(".", ""),
                            )
                            session.add(doc)
                            await session.flush()

                            # Add initial chunk
                            chunk = DocumentChunk(
                                document_id=doc.id,
                                chunk_index=0,
                                content=content,
                            )
                            session.add(chunk)
                            logger.info(f"Ingested Doc for {org.slug}: {doc.title} ({access_level.value})")

            # Seed Default Security Policy
            pol_res = await session.execute(select(Policy).where(Policy.org_id == org.id, Policy.name == "Default Strict Policy"))
            if not pol_res.scalars().first():
                policy = Policy(
                    org_id=org.id,
                    name="Default Strict Policy",
                    policy_type=PolicyType.INPUT,
                    rules={
                        "block_prompt_injection": True,
                        "mask_pii_output": True,
                        "deny_unauthorized_tools": True,
                    },
                )
                session.add(policy)

        await session.commit()
        logger.info("Database seeding completed successfully!")


if __name__ == "__main__":
    asyncio.run(seed_data())

