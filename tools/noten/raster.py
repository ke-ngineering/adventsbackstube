import sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0, __import__('os').path.dirname(__file__)); from notenkoepfe import lines
import numpy as np
def annotate(src, clefs, out_prefix, x0=170, x1=2320, split=None):
    im=Image.open(src).convert('RGB'); L=lines(np.array(im.convert('L')))
    LET='CDEFGAB'
    try: font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 15)
    except: font=ImageFont.load_default()
    d=ImageDraw.Draw(im)
    for si,st in enumerate(L):
        top = 5*7+3 if clefs[si]=='t' else 3*7+5
        for k in range(-6,15):
            y=st[0]+k*9; di=top-k; name=LET[di%7]+str(di//7)
            col=(0,160,0) if k%2 else (220,0,0)
            for x in range(x0, x1, 6): d.point((x,y),fill=col)
            if k%2==0 or k<0 or k>8: d.text((x1+2,y-8),name,fill=col,font=font); d.text((x0-38,y-8),name,fill=col,font=font)
    # cut systems (pairs of staves)
    outs=[]
    for i in range(0,len(L),2):
        y0=int(L[i][0]-70); y1=int(L[i+1][4]+70)
        for j,(a,b) in enumerate(split or [(x0-45,x1+45)]):
            c=im.crop((a,y0,b,y1)); fn=f'{out_prefix}{i//2}{j}.png'; c.save(fn); outs.append(fn)
    print(outs)
annotate(sys.argv[1], sys.argv[2], sys.argv[3], split=[(125,1270),(1180,2365)])
