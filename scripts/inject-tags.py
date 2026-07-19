import re, html, zipfile, shutil, os

SRC = "/sessions/affectionate-wonderful-volta/mnt/WEB RPS/TEMPLATE_RPS.docx"
OUT = "/sessions/affectionate-wonderful-volta/mnt/outputs/template-merps.docx"
work = "/tmp/tpl/word/document.xml"
xml = open(work, encoding="utf-8").read()

def esc(s): return s.replace("&","&amp;").replace("<","&lt;").replace(">","&gt;")
def wt_concat(block):
    return html.unescape("".join(re.findall(r'<w:t(?: [^>]*)?>(.*?)</w:t>', block, re.S)))

def replace_once(scope, old, new):
    nodes=[[m.start(),m.end(),m.group(1)] for m in re.finditer(r'<w:t(?: [^>]*)?>(.*?)</w:t>', scope, re.S)]
    texts=[html.unescape(n[2]) for n in nodes]
    concat="".join(texts)
    idx=concat.find(old)
    if idx<0: return scope, False
    a=idx; b=idx+len(old)
    owner=[]
    for i,t in enumerate(texts): owner += [i]*len(t)
    newtexts=[""]*len(nodes)
    for pos,ch in enumerate(concat):
        if a<=pos<b: continue
        newtexts[owner[pos]] += ch
    ins=owner[a] if a < len(concat) else len(nodes)-1
    prefix_len=sum(1 for pos in range(a) if owner[pos]==ins)
    nt=newtexts[ins]
    newtexts[ins]=nt[:prefix_len]+new+nt[prefix_len:]
    # splice back right-to-left
    for i in range(len(nodes)-1,-1,-1):
        s,e,_=nodes[i]
        scope=scope[:s]+'<w:t xml:space="preserve">'+esc(newtexts[i])+'</w:t>'+scope[e:]
    return scope, True

def set_whole(block, tag):
    ppr=re.search(r'<w:pPr>.*?</w:pPr>', block, re.S)
    ppr=ppr.group(0) if ppr else ""
    open_tag=re.match(r'<w:p\b[^>]*>', block).group(0)
    return open_tag+ppr+'<w:r><w:t xml:space="preserve">'+esc(tag)+'</w:t></w:r></w:p>'

# ---------- 1. RKPBM table rebuild ----------
tbls=[m.start() for m in re.finditer(r'<w:tbl>', xml)]
rk=None
for s in tbls:
    e=xml.find('</w:tbl>',s)+len('</w:tbl>')
    if 'Minggu Ke' in xml[s:e]:
        rk=(s,e); break
s,e=rk; block=xml[s:e]
first_tr=block.find('<w:tr')
rows=re.findall(r'<w:tr\b.*?</w:tr>', block, re.S)
header=rows[0]; tmpl=rows[1]
cells=re.findall(r'<w:tc>.*?</w:tc>', tmpl, re.S)
tags=['{#rkpbm}{minggu}','{tujuan}','{pokok}','{metoda}','{evaluasi}','{buku}{/rkpbm}']
newcells=[]
for c,tag in zip(cells,tags):
    tcpr=re.search(r'<w:tcPr>.*?</w:tcPr>', c, re.S)
    tcpr=tcpr.group(0) if tcpr else ""
    newcells.append('<w:tc>'+tcpr+'<w:p><w:r><w:t xml:space="preserve">'+esc(tag)+'</w:t></w:r></w:p></w:tc>')
newrow='<w:tr>'+''.join(newcells)+'</w:tr>'
newblock=block[:first_tr]+header+newrow+'</w:tbl>'
xml=xml[:s]+newblock+xml[e:]

# ---------- 2 & 3. loops: tujuan khusus & buku ----------
def find_para_by_text(exact):
    for m in re.finditer(r'<w:p\b.*?</w:p>', xml, re.S):
        if wt_concat(m.group(0)).strip()==exact:
            return m.group(0)
    return None

def R(t): return '<w:p><w:r><w:t xml:space="preserve">'+t+'</w:t></w:r></w:p>'

tk=["Mampu memahami & menjelaskan konsep Perpindahan Kalor & Penukar Kalor.",
    "Mengenal dan memahami prinsip-prinsip Perpindahan Kalor & Penukar Kalor.",
    "Mampu membuat rancangan penukar kalor sederhana."]
b1=find_para_by_text(tk[0]); b2=find_para_by_text(tk[1]); b3=find_para_by_text(tk[2])
xml=xml.replace(b1, R('{#tujuan_khusus}')+set_whole(b1,'{teks}')+R('{/tujuan_khusus}'))
xml=xml.replace(b2,''); xml=xml.replace(b3,'')

bu1="Holman, J.P., Jasjfi, E. 1997. Perpindahan Kalor (Heat Transfer), Penerbit Erlangga, Jakarta."
bu2="Mahmudi, Ali., 2005. Modul Bahan Ajar Perpindahan Kalor dan Penukar Kalor, Politeknik Negeri Bandung, Bandung."
pb1=find_para_by_text(bu1); pb2=find_para_by_text(bu2)
ppr1=re.search(r'<w:pPr>.*?</w:pPr>', pb1, re.S); ppr1=ppr1.group(0) if ppr1 else ""
pend_item='<w:p>'+ppr1+'<w:r><w:t xml:space="preserve">{teks}</w:t></w:r></w:p>'
pend_head='<w:p><w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">b. Buku Pendukung:</w:t></w:r></w:p>'
xml=xml.replace(pb1, R('{#buku_utama}')+set_whole(pb1,'{teks}'))
xml=xml.replace(pb2, R('{/buku_utama}')+pend_head+R('{#buku_pendukung}')+pend_item+R('{/buku_pendukung}'))

# ---------- 4. ROW pass (hbh, etika, essay) ----------
ROW=[ (lambda t:t.strip().startswith("Sikap"), [("10","{hbh_sikap}")]),
      (lambda t:"Latihan dan Kuis" in t, [("5","{hbh_latihan_kuis}")]),
      (lambda t:t.strip().startswith("Tugas"), [("5","{hbh_tugas}")]),
      (lambda t:"Kerapian" in t, [("2,5","{etika_kerapian}")]),
      (lambda t:"Kerja Sama" in t, [("2,5","{etika_kerja_sama}")]),
      (lambda t:"Kedisiplinan" in t, [("2,5","{etika_kedisiplinan}")]),
      (lambda t:"Ketelitian" in t, [("2,5","{etika_ketelitian}")]),
      (lambda t:"Essay Test (UTS)" in t, [("30","{uts}")]),
      (lambda t:"Essay Test (UAS)" in t, [("40","{uas}")]) ]
def row_handler(m):
    blk=m.group(0); t=wt_concat(blk)
    for mf,repls in ROW:
        if mf(t):
            for old,new in repls: blk,_=replace_once(blk,old,new)
            return blk
    return blk
xml=re.sub(r'<w:tr\b.*?</w:tr>', row_handler, xml, flags=re.S)

# ---------- 5. PARAGRAPH pass ----------
WHOLE=[ (lambda t:t.strip()=="SYAHRIZAL, ST., MT.","{dosen_utama_nama}"),
        (lambda t:t.strip()=="BAMBANG DWI HARIPRIADI, ST., MT.","{ka_prodi_nama}"),
        (lambda t:t.strip()=="IBNU HAJAR, ST., MT.","{ketua_jurusan_nama}"),
        (lambda t:"197310142021211005" in t,"{dosen_utama_nomor}"),
        (lambda t:"197801302021211004" in t,"{ka_prodi_nomor}"),
        (lambda t:"197108102021211001" in t,"{ketua_jurusan_nomor}"),
        (lambda t:"BENGKALIS, RIAU" in t,"{kota}, {tanggal}"),
        (lambda t:t.strip().startswith("BENGKALIS, 20 FEBRUARI"),"{kota}, {tanggal}"),
        (lambda t:t.strip().startswith("Mata kuliah Perpindahan Kalor & Penukar Kalor merupakan"),"{deskripsi_singkat}"),
        (lambda t:t.strip().startswith("Setelah mengikuti mata kuliah ini"),"{tujuan_umum}") ]
SUB=[ (lambda t:"PERPINDAHAN KALOR & PENUKAR KALOR" in t, [("PERPINDAHAN KALOR & PENUKAR KALOR","{mata_kuliah_upper}")]),
      (lambda t:t.strip().startswith("Mata Kuliah"), [("Perpindahan Kalor & Penukar Kalor","{mata_kuliah}")]),
      (lambda t:"Kode Mata Kuli" in t, [("KBPP 2152","{kode_mk}")]),
      (lambda t:"SKS/ Jam per minggu" in t, [("2 / 4","{sks} / {jam_per_minggu}")]),
      (lambda t:"Semester / Kelas" in t, [("VI (Kelas 3A-3B-3C)","{semester_kelas}")]),
      (lambda t:"Pra Syarat" in t, [("Termodinamika","{prasyarat}")]),
      (lambda t:"Dosen Pengampu" in t, [("Syahrizal, ST., MT.","{dosen_utama_nama}")]),
      (lambda t:"Perkiraan Jumlah Peserta" in t, [("27 - 30 Orang Mahasiswa","{perkiraan_peserta}")]),
      (lambda t:"Perkuliahan & Diskusi" in t, [("36 Jam","{perkuliahan_jam} Jam"),("(9 minggu)","({perkuliahan_minggu} minggu)")]),
      (lambda t:"Jam Latihan Soal dan Kuis" in t, [("8 Jam","{latihan_jam} Jam"),("(2 minggu)","({latihan_minggu} minggu)")]),
      (lambda t:t.strip().startswith("Praktikum") and "Jam" in t, [("12 Jam","{praktikum_jam} Jam"),("(3 Minggu)","({praktikum_minggu} minggu)")]),
      (lambda t:"Ujian Tengah dan Akhir Semester" in t and "4 Jam" in t, [("4 Jam","{ujian_jam} Jam")]),
      (lambda t:t.strip().replace(" ","")=="=60Jam", [("60 Jam","{total_jam} Jam")]),
      (lambda t:"Ujian Tengah Semester" in t and "30 %" in t, [("30 %","{uts} %")]),
      (lambda t:"Ujian Akhir Semester" in t and "40 %" in t, [("40 %","{uas} %")]),
      (lambda t:"Nilai Kegiatan Perkuliahan" in t, [("20 %","{nkp} %")]),
      (lambda t:"Nilai Kegiatan Praktikum" in t, [("10 %","{nkpr} %")]) ]
def para_handler(m):
    blk=m.group(0); t=wt_concat(blk)
    for mf,tag in WHOLE:
        if mf(t): return set_whole(blk,tag)
    for mf,repls in SUB:
        if mf(t):
            for old,new in repls: blk,_=replace_once(blk,old,new)
            return blk
    return blk
xml=re.sub(r'<w:p\b.*?</w:p>', para_handler, xml, flags=re.S)

open(work,"w",encoding="utf-8").write(xml)

# ---------- repackage: copy original zip, replace document.xml ----------
shutil.copy(SRC, OUT)
# rebuild zip with replaced document.xml
tmpzip=OUT+".tmp"
with zipfile.ZipFile(SRC,'r') as zin, zipfile.ZipFile(tmpzip,'w',zipfile.ZIP_DEFLATED) as zout:
    for item in zin.infolist():
        data=zin.read(item.filename)
        if item.filename=="word/document.xml":
            data=xml.encode("utf-8")
        zout.writestr(item, data)
os.replace(tmpzip, OUT)
print("written", OUT, os.path.getsize(OUT))
# quick check: count tags
tagset=sorted(set(re.findall(r'\{[#/]?[a-z_]+\}', xml)))
print("tags present:", tagset)
