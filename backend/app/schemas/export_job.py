from pydantic import BaseModel


class ExportJobOut(BaseModel):
    id: str
    projectId: str
    status: str
    progress: float
    outputAvailable: bool
    errorMessage: str | None = None
