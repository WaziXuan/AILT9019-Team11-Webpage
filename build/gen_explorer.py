import json, subprocess, sys
def run(q, city, tag=None):
    a=[sys.executable,"src/classify.py",q,"--city",city]+(["--tag",tag] if tag else [])
    r=json.loads(subprocess.run(a,capture_output=True,text=True,encoding="utf-8").stdout)
    c=r.get("category") or {}; ci=r.get("citation") or {}
    o={"s":r["status"]}
    if r["status"]=="matched":
        o.update(code=c.get("code"),cat=c.get("en"),catzh=c.get("zh"),item=(r.get("item") or {}).get("en"),
                 itemzh=(r.get("item") or {}).get("zh"),prep=r.get("prep_en"),src=ci.get("en"),url=ci.get("url"))
    else:
        o["msg"]=r.get("question_en") or r.get("message_en")
    return o
items=[("plastic drink bottle","bottle",{}),("newspaper","paper",{}),("cardboard box","box",{}),
       ("rechargeable battery","battery",{}),("fluorescent tube","tube",{}),
       ("milk carton","carton",{"shanghai":[("cond_special_collection","Dedicated collection here"),("cond_no_special_collection","No dedicated collection")]}),
       ("styrofoam","foam",{"shanghai":[("cond_rinsed","Rinsed"),("cond_food_residue","Has food residue")],
                            "hongkong":[("cond_rinsed","Rinsed"),("cond_food_residue","Has food residue")]}),
       ("fruit peel","peel",{}),("plastic","material",{})]
out=[]
for q,icon,conds in items:
    row={"q":q,"icon":icon}
    for city in ("shanghai","hongkong"):
        o=run(q,city)
        if city in conds: o["opts"]=[{"label":lab,"r":run(q,city,t)} for t,lab in conds[city]]
        row[city]=o
    out.append(row)
json.dump(out,sys.stdout,ensure_ascii=False,separators=(",",":"))
