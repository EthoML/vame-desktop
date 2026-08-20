"""Log serving returns the *newest* part of a log, capped in size.

The UI polls this while a step runs, so the useful bytes are always the ones at
the end. Reading the head instead would leave a long-running step's terminal
frozen on its first few seconds of output.
"""

import pytest

from vame_app.services.file_service import _TAIL_BYTES, log_file


def _write_log(project, name, text):
    logs = project / "logs"
    logs.mkdir(exist_ok=True)
    (logs / f"{name}.log").write_text(text)


def _numbered_lines(count):
    # ~40 bytes/line, so the caller can size a file against the cap.
    return "".join(f"line {i:07d} {'x' * 24}\n" for i in range(count))


def test_returns_the_tail_not_the_head(tmp_path):
    lines = _numbered_lines(_TAIL_BYTES // 40 * 3)  # comfortably over the cap
    _write_log(tmp_path, "big", lines)

    out = log_file(tmp_path, "big")
    all_lines = lines.rstrip("\n").split("\n")

    assert out.rstrip("\n").split("\n")[-1] == all_lines[-1], "last line missing"
    assert all_lines[0] not in out, "returned the head instead of the tail"


def test_capped_at_the_limit(tmp_path):
    _write_log(tmp_path, "big", _numbered_lines(_TAIL_BYTES // 40 * 3))
    assert len(log_file(tmp_path, "big").encode()) <= _TAIL_BYTES


def test_starts_on_a_line_boundary(tmp_path):
    # Seeking mid-file lands inside a line; that fragment must be dropped rather
    # than shown as a mangled first entry.
    _write_log(tmp_path, "big", _numbered_lines(_TAIL_BYTES // 40 * 3))
    first = log_file(tmp_path, "big").split("\n")[0]
    assert first.startswith("line "), f"partial line leaked: {first!r}"


def test_small_log_is_returned_whole(tmp_path):
    text = "only line\nsecond line\n"
    _write_log(tmp_path, "small", text)
    assert log_file(tmp_path, "small") == text


def test_missing_log_raises(tmp_path):
    (tmp_path / "logs").mkdir()
    with pytest.raises(BaseException):
        log_file(tmp_path, "nope")
