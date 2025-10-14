#!/usr/bin/env python3
"""
ONE Platform - Done Hook
Marks current inference complete and advances to next inference.

This hook runs on Stop event to:
- Mark current inference as complete
- Capture lessons learned (if any)
- Advance to next inference
- Save updated state
"""
import json
import sys
import os
from pathlib import Path
from typing import Dict, Any

# Import task descriptions from todo hook
from todo import INFERENCE_TASKS, get_dimensions_for_inference, get_specialist_for_inference


def load_state() -> Dict[str, Any]:
    """Load current inference state from .claude/state/inference.json"""
    state_file = Path(os.environ.get("CLAUDE_PROJECT_DIR", ".")) / ".claude" / "state" / "inference.json"

    if not state_file.exists():
        # Initialize default state
        default_state = {
            "current_inference": 1,
            "completed_inferences": [],
            "feature_name": "New Feature",
            "organization": "Default Org",
            "person_role": "platform_owner",
            "lessons_learned": []
        }
        return default_state

    return json.loads(state_file.read_text())


def save_state(state: Dict[str, Any]):
    """Save inference state to .claude/state/inference.json"""
    state_file = Path(os.environ.get("CLAUDE_PROJECT_DIR", ".")) / ".claude" / "state" / "inference.json"
    state_file.parent.mkdir(parents=True, exist_ok=True)
    state_file.write_text(json.dumps(state, indent=2))


def extract_lesson_from_transcript(transcript_path: str, inference: int) -> str:
    """Extract lesson learned from conversation transcript"""
    # TODO: Parse transcript JSONL to extract key learnings
    # For now, return a placeholder
    return f"Completed inference {inference} successfully"


def mark_complete_and_advance(state: Dict[str, Any], transcript_path: str) -> Dict[str, Any]:
    """Mark current inference complete and advance to next"""
    current = state["current_inference"]

    # Mark current inference as complete
    if current not in state["completed_inferences"]:
        state["completed_inferences"].append(current)
        state["completed_inferences"].sort()

    # Extract lesson learned
    lesson = extract_lesson_from_transcript(transcript_path, current)
    state["lessons_learned"].append({
        "inference": current,
        "lesson": lesson,
        "timestamp": os.times().elapsed
    })

    # Advance to next inference (unless we're at 100)
    if current < 100:
        state["current_inference"] = current + 1
    else:
        # Feature complete!
        state["current_inference"] = 100
        state["feature_complete"] = True

    return state


def generate_completion_message(state: Dict[str, Any]) -> str:
    """Generate message shown after marking complete"""
    previous = state["current_inference"] - 1 if state["current_inference"] > 1 else 1
    current = state["current_inference"]
    completed_count = len(state["completed_inferences"])
    progress_pct = (completed_count / 100) * 100

    task = INFERENCE_TASKS.get(current, "Unknown task")
    dimensions = get_dimensions_for_inference(current)
    specialist = get_specialist_for_inference(current)

    message = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ INFERENCE COMPLETE: Infer {previous}/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Progress:** {completed_count}/100 inferences complete ({progress_pct:.0f}%)
**Feature:** {state["feature_name"]}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 NEXT INFERENCE: Infer {current}/100
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Task:** {task}
**Ontology Dimensions:** {", ".join(dimensions) if dimensions else "Foundation"}
**Assigned Specialist:** {specialist if specialist else "Engineering Director"}

Ready to continue? Type your next prompt or use:
  /done     - Mark this inference complete (when finished)
  /next     - Skip to next inference (if not applicable)
  /plan     - View complete 100-inference plan

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    if completed_count == 100:
        message = f"""
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 FEATURE COMPLETE: {state["feature_name"]}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**All 100 inferences completed successfully!**

**Final Stats:**
- Organization: {state["organization"]}
- Person Role: {state["person_role"]}
- Lessons Learned: {len(state.get("lessons_learned", []))}

**Next Steps:**
1. Review lessons learned: /lessons
2. Start new feature: /one
3. Generate documentation: /document

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Congratulations! 🎊 Your feature is production-ready.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"""

    return message


def main():
    try:
        # Load hook input from stdin
        input_data = json.load(sys.stdin)
        transcript_path = input_data.get("transcript_path", "")

        # Load current state
        state = load_state()

        # Mark complete and advance
        state = mark_complete_and_advance(state, transcript_path)

        # Save updated state
        save_state(state)

        # Generate completion message
        message = generate_completion_message(state)

        # Output message (shown in transcript mode with Ctrl-R)
        print(message)

        # Exit with success
        sys.exit(0)

    except Exception as e:
        # Log error but don't block
        print(f"Error in done hook: {e}", file=sys.stderr)
        sys.exit(0)


if __name__ == "__main__":
    main()
