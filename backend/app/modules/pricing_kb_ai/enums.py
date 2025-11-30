from enum import Enum


class NodeType(str, Enum):
    SEGMENT = "segment"
    FAMILY = "family"
    CLASS = "class"
    CATEGORY = "category"


class NodeStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"


class SchemaStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class LifecycleStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    ACTIVE = "active"
    ARCHIVED = "archived"


class PresetMode(str, Enum):
    INCLUDE = "include"
    EXCLUDE = "exclude"


class CardVersionStatus(str, Enum):
    DRAFT = "draft"
    REVIEW = "review"
    PUBLISHED = "published"


class SearchMode(str, Enum):
    TEXT = "text"
    SEMANTIC = "semantic"
    COMBINED = "combined"
