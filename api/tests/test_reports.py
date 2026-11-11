import pytest
from httpx import AsyncClient

from app.routers import reports


@pytest.mark.asyncio
async def test_explanation_retry_and_replay(client: AsyncClient, auth_headers, monkeypatch, tmp_path):
    monkeypatch.setattr(reports.settings, "upload_dir", str(tmp_path))
    monkeypatch.setattr(reports, "extract_text", lambda _: "Glucose 95 mg/dL 70-100")

    class FakeAI:
        calls = 0

        async def stream_explanation(self, values):
            self.calls += 1
            if self.calls == 1:
                raise RuntimeError("Synthetic provider failure")
            assert len(values) == 1
            yield "Here is your sample explanation."

    provider = FakeAI()
    monkeypatch.setattr(reports, "get_ai_service", lambda: provider)
    response = await client.post(
        "/api/v1/reports", headers=auth_headers,
        files={"file": ("sample.pdf", b"%PDF-demo", "application/pdf")},
    )
    assert response.status_code == 201
    path = "/api/v1/reports/" + response.json()["id"]
    failed = await client.get(path + "/explain", headers=auth_headers)
    assert '"error"' in failed.text
    explained = await client.get(path + "/explain", headers=auth_headers)
    assert '"done":true' in explained.text
    replay = await client.get(path + "/explain", headers=auth_headers)
    assert replay.text == explained.text
    assert provider.calls == 2
    detail = (await client.get(path, headers=auth_headers)).json()
    assert detail["status"] == "done"
    assert len(detail["values"]) == 1
