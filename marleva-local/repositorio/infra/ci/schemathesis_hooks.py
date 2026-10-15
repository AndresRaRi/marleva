"""Generate valid fictional mailboxes without suppressing generator health checks."""
import schemathesis
from hypothesis import strategies as st

schemathesis.openapi.format(
    "email",
    st.from_regex(r"[a-z0-9]{1,40}@example\.test", fullmatch=True),
)
