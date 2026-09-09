import re

with open('indicator/smc-v6.pine') as f:
    lines = f.readlines()

# Collect builtins and user functions
builtins = {
    'open', 'high', 'low', 'close', 'volume', 'time', 'hl2', 'hlc3', 'ohlc4', 'tr',
    'bar_index', 'barstate', 'syminfo', 'timeframe', 'color', 'size', 'style', 'line',
    'box', 'label', 'table', 'array', 'ta', 'math', 'str', 'request', 'display',
    'extend', 'xloc', 'yloc', 'format', 'location', 'shape', 'position', 'text', 'barmerge',
    'na', 'true', 'false', 'plot', 'plotshape', 'plotchar', 'plotcandle', 'alertcondition',
    'input', 'indicator', 'var', 'varip', 'float', 'int', 'bool', 'string', 'color',
    'for', 'to', 'by', 'while', 'if', 'else', 'switch', 'break', 'continue', 'return',
    'bgcolor', 'fill', 'nz', 'fixnan', 'runtime', 'method', 'defval', 'title', 'minval', 'maxval',
    'step', 'options', 'inline', 'group', 'tooltip', 'overlay', 'max_boxes_count', 'max_lines_count',
    'max_labels_count', 'max_bars_back', 'shorttitle', 'precision'
}

# User functions declared with =>
user_funcs = set()
for l in lines:
    m = re.match(r'^\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\([^)]*\)\s*=>', l)
    if m:
        user_funcs.add(m.group(1))

first_assigned = {}
assign_re = re.compile(r'^\s*(?:var\s+(?:(?:int|float|bool|string|color|line|box|label|table)\s+|[a-zA-Z0-9_]+\[\]\s+)?|var\s+|(?:\b(?:int|float|bool|string|color)\s+))?([a-zA-Z_][a-zA-Z0-9_]*)\s*(?:\[[^\]]*\])?\s*[:=]=?')
tuple_assign_re = re.compile(r'^\s*\[([^\]]+)\]\s*=')

for idx, line in enumerate(lines, 1):
    # remove comments and strings
    cleaned = re.sub(r'".*?"|\'.*?\'|//.*', '', line).strip()
    if not cleaned: continue
    
    m_t = tuple_assign_re.match(cleaned)
    if m_t:
        for v in m_t.group(1).split(','):
            v = v.strip()
            if v and v not in first_assigned:
                first_assigned[v] = idx
        continue
    
    m = assign_re.match(cleaned)
    if m:
        v = m.group(1)
        if v not in first_assigned:
            first_assigned[v] = idx

print(f"Total first_assigned identifiers: {len(first_assigned)}")

# Check top-level statements (lines with indentation 0) for usages of variables before assignment
issues = []
for idx, line in enumerate(lines, 1):
    if line.startswith(' ') or line.startswith('\t'):
        continue # skip inside functions / if blocks for now
    cleaned = re.sub(r'".*?"|\'.*?\'|//.*', '', line).strip()
    if not cleaned: continue
    
    # Exclude the left-hand side of assignment
    rhs = cleaned
    m = re.match(r'^(?:\[.*?\]|[a-zA-Z0-9_.\s]+)\s*[:=]=?\s*(.*)', cleaned)
    if m:
        rhs = m.group(1)
    
    # Find all identifier tokens
    tokens = re.findall(r'\b([a-zA-Z_][a-zA-Z0-9_]*)\b', rhs)
    for tok in tokens:
        if tok in builtins or tok in user_funcs: continue
        if tok in first_assigned and first_assigned[tok] > idx:
            issues.append((idx, tok, first_assigned[tok]))

if issues:
    print(f"❌ Found {len(issues)} possible usages before definition:")
    for l_use, tok, l_def in issues:
        print(f"  - Line {l_use}: '{tok}' used before definition at line {l_def}")
else:
    print("✅ 0 top-level usages before definition found across all 1,828 lines!")
