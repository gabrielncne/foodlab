"""Run from project root: python -m uvicorn backend.main:app --port 8000."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles

from .catalog import PROJECT_ROOT, load_catalog
from .recommender import Recommender
from .schemas import RecommendationRequest, RecommendationResponse


def create_app(catalog_path: Path | None = None, *, serve_frontend: bool = True) -> FastAPI:
    @asynccontextmanager
    async def lifespan(application: FastAPI):
        application.state.recommender = Recommender(load_catalog(catalog_path))
        yield

    application = FastAPI(title="FoodMatch AI", version="1.0.0", lifespan=lifespan)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:5173", "http://localhost:5173", "http://127.0.0.1:4173", "http://localhost:4173"],
        allow_methods=["GET", "POST"], allow_headers=["Content-Type"],
    )

    @application.exception_handler(RequestValidationError)
    async def invalid_request(_: Request, error: RequestValidationError):
        # Do not reflect raw input values; non-finite JSON numbers must still
        # produce a serializable 422 response instead of crashing the handler.
        return JSONResponse(status_code=422, content={"detail": [
            {"loc": list(item["loc"]), "msg": item["msg"], "type": item["type"]}
            for item in error.errors()
        ]})

    @application.exception_handler(Exception)
    async def internal_error(_: Request, error: Exception):
        logging.getLogger("foodmatch").error("Unhandled recommendation failure", exc_info=error)
        return JSONResponse(status_code=500, content={"detail": "Não foi possível concluir a consulta. Tente novamente."})

    @application.get("/api/health")
    def health(request: Request):
        return {"status": "ok", "restaurants": len(request.app.state.recommender.restaurants), "model": "tfidf-cosine-v1"}

    @application.post("/api/recommendations", response_model=RecommendationResponse)
    def recommendations(preferences: RecommendationRequest, request: Request):
        return request.app.state.recommender.recommend(preferences)

    # Unknown API paths must remain JSON 404, never the SPA's HTML document.
    @application.api_route("/api/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
    def missing_api(path: str):
        return JSONResponse(status_code=404, content={"detail": "Endpoint não encontrado."})

    dist = PROJECT_ROOT / "dist"
    if serve_frontend and (dist / "index.html").is_file():
        class SPAFiles(StaticFiles):
            async def get_response(self, path, scope):
                from starlette.exceptions import HTTPException
                try:
                    return await super().get_response(path, scope)
                except HTTPException as error:
                    if error.status_code == 404 and "." not in path.rsplit("/", 1)[-1]:
                        return await super().get_response("index.html", scope)
                    raise

        application.mount("/", SPAFiles(directory=dist, html=True), name="frontend")
    return application


app = create_app()
