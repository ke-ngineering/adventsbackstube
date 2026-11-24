# Notenkopf-Erkennung: findet Köpfe pro Notensystem und rechnet y -> Tonhöhe (ohne Vorzeichen)
import sys, numpy as np
from PIL import Image
from scipy import ndimage as nd
def lines(im):
    dark=(im[:,400:2200]<120).mean(axis=1); rows=[y for y in range(im.shape[0]) if dark[y]>0.6]; g=[]
    for y in rows:
        if g and y-g[-1][-1]<=2: g[-1].append(y)
        else: g.append([y])
    c=[sum(x)/len(x) for x in g]; return [c[i:i+5] for i in range(0,len(c),5)]
TREBLE=['F5','E5','D5','C5','B4','A4','G4','F4','E4','D4','C4','B3','A3']  # from top line downwards in steps
def names(top, clef):
    # diatonic steps from top line
    seq_t=['F5','E5','D5','C5','B4','A4','G4','F4','E4','D4','C4','B3','A3','G3']
    seq_b=['A3','G3','F3','E3','D3','C3','B2','A2','G2','F2','E2','D2','C2']
    up_t=['G5','A5','B5','C6']; up_b=['B3','C4','D4','E4','F4']
    return (seq_t,up_t) if clef=='t' else (seq_b,up_b)
def heads(path, x0=150, x1=2350):
    im=np.array(Image.open(path).convert('L')); L=lines(im); out=[]
    b=im<130
    # remove staff lines
    for st in L:
        for y in st:
            y=int(round(y)); b[y-2:y+3,:]&= ~((im[y-2:y+3,:]<130)&(im[y-5:y-2,:].min(0)>130)[None,:]&(im[y+3:y+6,:].min(0)>130)[None,:])
    # remove thin vertical stems: opening with horizontal structuring element
    b2=nd.binary_opening(b,structure=np.ones((1,9)))
    b2=nd.binary_fill_holes(nd.binary_closing(b,structure=np.ones((5,5))))&nd.binary_opening(nd.binary_fill_holes(b),structure=np.ones((11,13)))
    lab,n=nd.label(b2); objs=nd.find_objects(lab)
    for i,s in enumerate(objs):
        h=s[0].stop-s[0].start; w=s[1].stop-s[1].start
        if 12<=h<=24 and 16<=w<=34:
            cy=(s[0].start+s[0].stop)/2; cx=(s[1].start+s[1].stop)/2
            if not (x0<cx<x1): continue
            # nearest staff
            si=min(range(len(L)),key=lambda k: abs(cy-(L[k][0]+L[k][4])/2)); st=L[si]
            step=round((cy-st[0])/9)  # 0 = top line
            filled=(im[s][lab[s]==i+1]<130).mean()>0.8
            out.append((si,round(cx),step,filled))
    return L,out
if __name__=='__main__':
    L,o=heads(sys.argv[1]); clefs=sys.argv[2]  # e.g. 'tbtbtb'
    LET='CDEFGAB'
    def nm(top, st):  # top line diatonic index minus steps
        d=top-st; return LET[d%7]+str(d//7)
    for si in range(len(L)):
        top = 5*7+3 if clefs[si]=='t' else 3*7+5   # F5 / A3 as diatonic index (C0=0)
        row=[(x,nm(top,st),'●' if f else '○') for (s,x,st,f) in sorted(o) if s==si]
        print(f'Staff {si} ({clefs[si]}):', ' '.join(f'{x}:{n}{f}' for x,n,f in sorted(row)))
