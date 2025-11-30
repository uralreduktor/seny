from typing import Optional

from pydantic import BaseModel, ConfigDict


class StageBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    required_role: Optional[str] = None
    requires_all_positions_calculated: bool = False
    requires_commercial_proposal: bool = False
    order: int = 0


class StageCreate(StageBase):
    pass


class StageUpdate(StageBase):
    pass


class StageResponse(StageBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
