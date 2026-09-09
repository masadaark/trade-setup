import re

with open('indicator/smc-v6.pine', 'r') as f:
    lines = f.readlines()

# Collect declared identifiers and their line numbers
declared = {}
builtins = {
    'open', 'high', 'low', 'close', 'volume', 'time', 'hl2', 'hlc3', 'ohlc4', 'tr',
    'bar_index', 'barstate', 'syminfo', 'timeframe', 'color', 'size', 'style', 'line',
    'box', 'label', 'table', 'array', 'ta', 'math', 'str', 'request', 'display',
    'extend', 'xloc', 'yloc', 'format', 'location', 'shape', 'position', 'text', 'barmerge',
    'na', 'true', 'false', 'plot', 'plotshape', 'plotchar', 'plotcandle', 'alertcondition',
    'input', 'indicator', 'var', 'varip', 'float', 'int', 'bool', 'string', 'color',
    'for', 'to', 'by', 'while', 'if', 'else', 'switch', 'break', 'continue', 'return',
    'bgcolor', 'fill', 'nz', 'fixnan', 'runtime', 'method'
}

# Regex to find variable assignments:
# var_name = ... or var type var_name = ... or [a, b] = ... or var_name := ...
assign_re = re.compile(r'^\s*(?:var\s+(?:(?:int|float|bool|string|color|line|box|label|table)\s+|[a-zA-Z0-9_]+\[\]\s+)?|var\s+|(?:\b(?:int|float|bool|string|color)\s+))?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[[^\]]*\])?\s*[:=]=?')
tuple_assign_re = re.compile(r'^\s*\[([^\]]+)\]\s*=')

for idx, line in enumerate(lines, 1):
    l = line.split('//')[0].strip()
    if not l: continue
    
    # Check tuple assignments
    m_t = tuple_assign_re.match(l)
    if m_t:
        vars_in_tuple = [v.strip() for v in m_t.group(1).split(',')]
        for v in vars_in_tuple:
            if v and v not in declared:
                declared[v] = idx
        continue
        
    # Check regular assignments
    m = assign_re.match(l)
    if m:
        v = m.group(1)
        if v not in declared and v not in builtins:
            declared[v] = idx

print(f"Total declared variables tracked: {len(declared)}")

# Now check each alertcondition line
alerts = []
for idx, line in enumerate(lines, 1):
    l = line.split('//')[0].strip()
    m = re.match(r'alertcondition\s*\(\s*([a-zA-Z0-9_]+)', l)
    if m:
        cond_var = m.group(1)
        alerts.append((idx, cond_var))

print(f"Found {len(alerts)} alertcondition calls:")
for line_num, cond_var in alerts:
    decl_line = declared.get(cond_var)
    if decl_line is None:
        print(f"❌ Line {line_num}: alertcondition({cond_var}) -> '{cond_var}' is NEVER declared!")
    elif decl_line > line_num:
        print(f"❌ Line {line_num}: alertcondition({cond_var}) -> '{cond_var}' declared on line {decl_line} (USED BEFORE DEFINED!)")
    else:
        print(f"✅ Line {line_num}: alertcondition({cond_var}) -> declared on line {decl_line}")

