import re
import time


def detect_language(code: str) -> str:
    """Detect the programming language of a code snippet.

    Args:
        code: The source code snippet to analyze.

    Returns:
        A plain text summary of the detected language and confidence.
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

    return f"Detected language: {language} (confidence: {confidence})"


def analyze_style(code: str) -> str:
    """Analyze a code snippet for style violations and formatting issues.

    Args:
        code: The source code snippet to analyze.

    Returns:
        A plain text summary of style findings.
    """
    time.sleep(2)

    lines = code.splitlines()
    findings = []

    for i, line in enumerate(lines, start=1):
        if len(line) > 100:
            findings.append(f"Line {i}: {len(line)} characters — keep it under 100.")
        if "\t" in line and "    " in line:
            findings.append(f"Line {i}: mixing tabs and spaces. Pick one.")

    if not findings:
        total_lines = len(lines)
        if total_lines > 50:
            findings.append(f"Function is {total_lines} lines long. Short functions are a virtue.")
        else:
            findings.append("Style looks passable. I've seen worse. That's not a compliment.")

    return "\n".join(findings)


def analyze_complexity(code: str) -> str:
    """Estimate the cyclomatic complexity of a code snippet.

    Args:
        code: The source code snippet to analyze.

    Returns:
        A plain text summary of complexity metrics.
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

    return f"Function '{func_name}': cyclomatic complexity {complexity}, {len(lines)} lines. {verdict}"


def check_naming(code: str) -> str:
    """Check a code snippet for poor naming conventions.

    Args:
        code: The source code snippet to check.

    Returns:
        A plain text summary of naming issues.
    """
    time.sleep(2)

    issues = []

    single_letter_vars = re.findall(r'\b(?<!["\'])([a-z])\s*=\s*(?!\s*["\'])', code)
    seen = set()
    for var in single_letter_vars:
        if var not in seen and var not in ("i", "j", "k", "n", "x", "y"):
            issues.append(f"'{var}' tells me nothing. What on earth does it hold?")
            seen.add(var)

    generic_names = re.findall(r'\b(tmp\w*|temp\w*|data\w*|helper\w*|stuff\w*|foo\w*|bar\w*)\b', code)
    for name in set(generic_names):
        issues.append(f"'{name}' is not a name, it's a cry for help. Name it after what it actually does.")

    if not issues:
        return "Naming is tolerable. I still hate the rest of it."

    return "\n".join(issues)


def check_security(code: str) -> str:
    """Scan a code snippet for common security vulnerabilities.

    Args:
        code: The source code snippet to scan.

    Returns:
        A plain text summary of security findings.
    """
    time.sleep(1.5)

    findings = []

    patterns = [
        ("eval(", "CRITICAL", "eval() on user input is how you get owned. Remove it."),
        ("exec(", "CRITICAL", "exec() is a loaded gun pointed at your foot."),
        ("shell=True", "CRITICAL", "shell=True in subprocess is an injection vector. Use a list of args."),
        ("pickle.loads", "HIGH", "Deserializing pickle from untrusted input. Enjoy your RCE."),
        ("md5(", "MEDIUM", "MD5 is not a security primitive anymore. Use SHA-256 at minimum."),
        ("password", "MEDIUM", "Hardcoded 'password' string found. Is this actually in the code?"),
        ("TODO", "INFO", "TODO comments in security-sensitive code. Fix it before shipping."),
        ("SELECT *", "MEDIUM", "SELECT * is lazy. Also check for SQL injection while you're at it."),
        ("strcpy(", "CRITICAL", "strcpy has no bounds checking. This is 1988 calling."),
        ("gets(", "CRITICAL", "gets() was deprecated for a reason. Buffer overflow waiting to happen."),
    ]

    for pattern, severity, message in patterns:
        if pattern.lower() in code.lower():
            findings.append(f"[{severity}] {message}")

    if not findings:
        return "No obvious security disasters found. That just means I didn't look hard enough."

    return "\n".join(findings)

