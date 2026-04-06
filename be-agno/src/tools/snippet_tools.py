import json
import time


def detect_language(code: str) -> str:
    """Detect the programming language of a code snippet.

    Args:
        code: The source code snippet to analyze.

    Returns:
        JSON string with the detected language and confidence.
    """
    time.sleep(1)

    code_lower = code.lower()

    if any(k in code for k in ["def ", "import ", "elif ", "print(", "self."]):
        language, confidence = "Python", "high"
    elif any(k in code for k in ["func ", "package ", ":= ", "goroutine"]):
        language, confidence = "Go", "high"
    elif any(k in code for k in ["fn ", "let mut", "println!", "impl ", "->", "pub fn"]):
        language, confidence = "Rust", "high"
    elif any(k in code for k in ["#include", "malloc(", "printf(", "->", "struct ", "typedef"]):
        language, confidence = "C", "high"
    elif any(k in code_lower for k in ["public class", "system.out", "void main", "@override"]):
        language, confidence = "Java", "high"
    elif any(k in code for k in ["const ", "let ", "=>", "console.log", "async ", "interface "]):
        language, confidence = "TypeScript/JavaScript", "high"
    else:
        language, confidence = "Unknown", "low"

    return json.dumps({"language": language, "confidence": confidence})


def analyze_style(code: str) -> str:
    """Analyze a code snippet for style violations and formatting issues.

    Args:
        code: The source code snippet to analyze.

    Returns:
        JSON string with a list of style findings, each having line, severity, and message.
    """
    time.sleep(2)

    lines = code.splitlines()
    findings = []

    for i, line in enumerate(lines, start=1):
        if len(line) > 100:
            findings.append({
                "line": i,
                "severity": "warning",
                "message": f"Line is {len(line)} characters. You think this is a novel? Keep it under 100.",
            })
        if "\t" in line and "    " in line:
            findings.append({
                "line": i,
                "severity": "error",
                "message": "Mixing tabs and spaces. Pick one and commit to it like an adult.",
            })

    if not findings:
        total_lines = len(lines)
        if total_lines > 50:
            findings.append({
                "line": 1,
                "severity": "warning",
                "message": f"This function is {total_lines} lines long. Short functions are a virtue.",
            })
        else:
            findings.append({
                "line": 1,
                "severity": "info",
                "message": "Style looks passable. I've seen worse. That's not a compliment.",
            })

    return json.dumps({"findings": findings})


def analyze_complexity(code: str) -> str:
    """Estimate the cyclomatic complexity of functions in a code snippet.

    Args:
        code: The source code snippet to analyze.

    Returns:
        JSON string with complexity metrics per detected function.
    """
    time.sleep(2)

    branch_keywords = ["if ", "elif ", "else:", "for ", "while ", "case ", "catch", "&&", "||", "and ", "or "]
    complexity = 1 + sum(code.count(kw) for kw in branch_keywords)

    lines = code.splitlines()
    func_name = "unknown"
    for line in lines:
        stripped = line.strip()
        if stripped.startswith("def ") or stripped.startswith("func ") or stripped.startswith("function "):
            func_name = stripped.split("(")[0].split()[-1]
            break

    if complexity <= 5:
        verdict = "Acceptable."
    elif complexity <= 10:
        verdict = "Getting hairy."
    else:
        verdict = "This is a disaster. Refactor it."

    return json.dumps({
        "functions": [
            {
                "name": func_name,
                "cyclomatic_complexity": complexity,
                "lines": len(lines),
                "verdict": verdict,
            }
        ]
    })


def check_naming(code: str) -> str:
    """Check a code snippet for poor naming conventions.

    Args:
        code: The source code snippet to check.

    Returns:
        JSON string with a list of naming issues, each having symbol and message.
    """
    time.sleep(2)

    import re
    issues = []

    single_letter_vars = re.findall(r'\b(?<!["\'])([a-z])\s*=\s*(?!\s*["\'])', code)
    seen = set()
    for var in single_letter_vars:
        if var not in seen and var not in ("i", "j", "k", "n", "x", "y"):
            issues.append({
                "symbol": var,
                "message": f"'{var}' tells me nothing. What on earth does it hold?",
            })
            seen.add(var)

    generic_names = re.findall(r'\b(tmp\w*|temp\w*|data\w*|helper\w*|stuff\w*|foo\w*|bar\w*)\b', code)
    for name in set(generic_names):
        issues.append({
            "symbol": name,
            "message": f"'{name}' is not a name, it's a cry for help. Name it after what it actually does.",
        })

    if not issues:
        issues.append({
            "symbol": "—",
            "message": "Naming is tolerable. I still hate the rest of it.",
        })

    return json.dumps({"issues": issues})


def check_security(code: str) -> str:
    """Scan a code snippet for common security vulnerabilities.

    Args:
        code: The source code snippet to scan.

    Returns:
        JSON string with a list of security findings, each having severity and message.
    """
    time.sleep(1.5)

    findings = []

    patterns = [
        ("eval(", "critical", "eval() on user input is how you get owned. Remove it."),
        ("exec(", "critical", "exec() is a loaded gun pointed at your foot."),
        ("shell=True", "critical", "shell=True in subprocess is an injection vector. Use a list of args."),
        ("pickle.loads", "high", "Deserializing pickle from untrusted input. Enjoy your RCE."),
        ("md5(", "medium", "MD5 is not a security primitive anymore. Use SHA-256 at minimum."),
        ("password", "medium", "Hardcoded 'password' string found. Is this actually in the code?"),
        ("TODO", "info", "TODO comments in security-sensitive code. Fix it before shipping."),
        ("SELECT *", "medium", "SELECT * is lazy. Also check for SQL injection while you're at it."),
        ("strcpy(", "critical", "strcpy has no bounds checking. This is 1988 calling."),
        ("gets(", "critical", "gets() was deprecated for a reason. Buffer overflow waiting to happen."),
    ]

    for pattern, severity, message in patterns:
        if pattern.lower() in code.lower():
            findings.append({"severity": severity, "message": message})

    if not findings:
        findings.append({
            "severity": "info",
            "message": "No obvious security disasters found. That just means I didn't look hard enough.",
        })

    return json.dumps({"findings": findings})
