import sys
s=open(sys.argv[1],encoding='utf-8').read(); d=open(sys.argv[2],encoding='utf-8').read().strip().replace('</','<'+chr(92)+'/')
assert '/*DATA*/' in s
open(sys.argv[3],'w',encoding='utf-8',newline='\n').write(s.replace('/*DATA*/',d))
