import subprocess
import json
import time
from pathlib import Path

REPO = Path("C:/Users/onein/pulsyn")
RESULTS = REPO / "docs/lab/results"
RESULTS.mkdir(parents=True, exist_ok=True)


def run_detached(name: str, cmd: str, log_file: str):
    log_path = RESULTS / log_file
    print(f"[{name}] launching: {cmd}")
    print(f"[{name}] log: {log_path}")
    with open(log_path, "w") as f:
        f.write("=" * 60 + "\n")
        f.write(f"{name} started at {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"command: {cmd}\n")
        f.write("=" * 60 + "\n")
    try:
        proc = subprocess.Popen(
            cmd,
            stdout=open(log_path, "a"),
            stderr=subprocess.STDOUT,
            cwd=REPO,
            shell=True,
            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP | subprocess.DETACHED_PROCESS,
        )
        print(f"[{name}] PID: {proc.pid}")
        return proc.pid
    except Exception as e:
        with open(log_path, "a") as f:
            f.write(f"\nLAUNCH ERROR: {e}\n")
        print(f"[{name}] launch failed: {e}")
        return None


pids = {}

# Integration tests
integration_cmd = "npm run test:integration"
pids["integration"] = run_detached("integration", integration_cmd, "integration-run.log")

# Certification
# cert:setup must succeed before cert:run-local; run them sequentially in one shell.
cert_cmd = "npm run cert:setup && npm run cert:run-local"
pids["certification"] = run_detached("certification", cert_cmd, "cert-run.log")

manifest = {
    "started_at": time.strftime("%Y-%m-%d %H:%M:%S"),
    "pids": pids,
    "commands": {
        "integration": integration_cmd,
        "certification": cert_cmd,
    },
}
manifest_path = RESULTS / "parallel-run-pids.json"
with open(manifest_path, "w") as f:
    json.dump(manifest, f, indent=2)
print(f"PID manifest saved to {manifest_path}")
