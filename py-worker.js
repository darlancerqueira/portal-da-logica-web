const PYODIDE_VERSION = "0.29.3";
const PYODIDE_BASE = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodidePromise = null;

const PYTHON_HELPERS = `
import ast


class SafeExecutionError(Exception):
    pass


def normalize_text(text):
    return " ".join(str(text).strip().split())


def validate_tree(tree):
    forbidden_nodes = (
        ast.Import,
        ast.ImportFrom,
        ast.With,
        ast.AsyncWith,
        ast.AsyncFor,
        ast.AsyncFunctionDef,
        ast.Raise,
        ast.Try,
        ast.Delete,
        ast.Global,
        ast.Nonlocal,
        ast.ClassDef,
        ast.Lambda,
        ast.Await,
        ast.While,
        ast.Yield,
        ast.YieldFrom,
    )
    forbidden_names = {
        "__import__",
        "breakpoint",
        "compile",
        "eval",
        "exec",
        "globals",
        "help",
        "input",
        "locals",
        "open",
        "quit",
        "exit",
        "vars",
    }

    for node in ast.walk(tree):
        if isinstance(node, forbidden_nodes):
            raise SafeExecutionError(type(node).__name__)
        if isinstance(node, ast.Name) and node.id in forbidden_names:
            raise SafeExecutionError(node.id)
        if isinstance(node, ast.Attribute) and node.attr.startswith("__"):
            raise SafeExecutionError(node.attr)


def execute_user_code(code):
    tree = ast.parse(code, mode="exec")
    validate_tree(tree)
    printed = []

    def safe_print(*args, sep=" ", end="\\n"):
        printed.append(sep.join(str(value) for value in args) + end)

    safe_builtins = {
        "abs": abs,
        "all": all,
        "any": any,
        "bool": bool,
        "enumerate": enumerate,
        "float": float,
        "int": int,
        "len": len,
        "list": list,
        "max": max,
        "min": min,
        "print": safe_print,
        "range": range,
        "reversed": reversed,
        "round": round,
        "sorted": sorted,
        "str": str,
        "sum": sum,
        "zip": zip,
    }

    namespace = {"__builtins__": safe_builtins}
    compiled = compile(tree, "<desafio-web>", "exec")
    exec(compiled, namespace, namespace)
    stdout = "".join(printed).rstrip("\\n")
    return namespace, stdout


def evaluate_check(check, namespace, stdout):
    check_type = check["type"]

    if check_type == "variable_equals":
        name = check["name"]
        if name not in namespace:
            return False, f"A variavel {name} nao foi criada."
        if namespace[name] != check["expected"]:
            return False, f"A variavel {name} deveria valer {check['expected']!r}, mas valeu {namespace[name]!r}."
        return True, "ok"

    if check_type == "function_cases":
        name = check["name"]
        if name not in namespace or not callable(namespace[name]):
            return False, f"A funcao {name} nao foi definida corretamente."
        function = namespace[name]
        for case in check["cases"]:
            args = case["args"]
            expected = case["expected"]
            try:
                result = function(*args)
            except Exception as error:
                return False, f"A funcao {name} falhou ao testar {args}: {error}"
            if result != expected:
                return False, f"A funcao {name}{tuple(args)} retornou {result!r}, mas o esperado era {expected!r}."
        return True, "ok"

    if check_type == "stdout_equals":
        expected = normalize_text(str(check["expected"]))
        if normalize_text(stdout) != expected:
            return False, f"A saida esperada era: {check['expected']}"
        return True, "ok"

    return False, "Validacao desconhecida."


def run_submission(user_code, checks):
    if not user_code.strip():
        return {"success": False, "message": "Nenhum codigo foi enviado."}

    try:
        namespace, stdout = execute_user_code(user_code)
    except SafeExecutionError as error:
        return {
            "success": False,
            "message": f"Seu codigo usa uma construcao bloqueada: {error}",
        }
    except SyntaxError as error:
        return {
            "success": False,
            "message": f"Erro de sintaxe na linha {error.lineno}: {error.msg}",
        }
    except Exception as error:
        return {
            "success": False,
            "message": f"Seu codigo gerou um erro durante a execucao: {error}",
        }

    for check in checks:
        ok, message = evaluate_check(check, namespace, stdout)
        if not ok:
            return {"success": False, "message": message}

    return {"success": True, "message": "Codigo correto."}
`;


async function ensurePyodide() {
    if (!pyodidePromise) {
        importScripts(`${PYODIDE_BASE}pyodide.js`);
        pyodidePromise = loadPyodide({ indexURL: PYODIDE_BASE }).then(async (pyodide) => {
            await pyodide.runPythonAsync(PYTHON_HELPERS);
            return pyodide;
        });
    }
    return pyodidePromise;
}


self.onmessage = async (event) => {
    const { id, type, payload } = event.data;

    try {
        const pyodide = await ensurePyodide();

        if (type === "warmup") {
            self.postMessage({ id, success: true, result: { ready: true } });
            return;
        }

        if (type === "run") {
            const checksProxy = pyodide.toPy(payload.checks || []);
            try {
                pyodide.globals.set("user_code", payload.code || "");
                pyodide.globals.set("checks", checksProxy);
                const jsonResult = await pyodide.runPythonAsync(
                    "import json\njson.dumps(run_submission(user_code, checks))"
                );
                self.postMessage({
                    id,
                    success: true,
                    result: JSON.parse(jsonResult),
                });
            } finally {
                checksProxy.destroy();
                pyodide.globals.delete("user_code");
                pyodide.globals.delete("checks");
            }
            return;
        }

        self.postMessage({
            id,
            success: false,
            error: `Tipo de mensagem desconhecido: ${type}`,
        });
    } catch (error) {
        self.postMessage({
            id,
            success: false,
            error: error && error.message ? error.message : String(error),
        });
    }
};
