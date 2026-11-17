"""Keep optimized core navigation functions in the standalone HTML."""
from pathlib import Path
import re
p=Path('mansion_war.html');s=p.read_text();source=Path('tools/navigation-performance.js').read_text()
for name in ['findPath','losWalk']:
 pattern=r'function '+name+r'\([^\n]*\{[\s\S]*?\n\}'
 new=re.search(pattern,source)
 if not new:raise RuntimeError('Missing optimized function '+name)
 s,n=re.subn(pattern,lambda _:new.group(0),s,count=1)
 if n!=1:raise RuntimeError('Missing HTML function '+name)
p.write_text(s)
