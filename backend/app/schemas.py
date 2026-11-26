from pydantic import BaseModel, EmailStr, Field
from typing import Any

class LoginInput(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=200)

class ContentInput(BaseModel):
    slug: str = Field(min_length=1, max_length=180, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9-]*$")
    title: str = Field(default="", max_length=240)
    data: dict[str, Any] = Field(default_factory=dict)
    is_published: bool = False
    is_featured: bool = False
    sort_order: int = 0

class ContentPatchInput(BaseModel):
    slug: str | None = Field(default=None, min_length=1, max_length=180, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9-]*$")
    title: str | None = Field(default=None, max_length=240)
    data: dict[str, Any] | None = None
    is_published: bool | None = None
    is_featured: bool | None = None
    sort_order: int | None = None


class ContactInput(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    subject: str = Field(min_length=2, max_length=200)
    message: str = Field(min_length=10, max_length=5000)
