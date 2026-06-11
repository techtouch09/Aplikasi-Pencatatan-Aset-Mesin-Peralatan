let dataAset = JSON.parse(localStorage.getItem("dataAsetMesin")) || [];
let dataPinjam = JSON.parse(localStorage.getItem("dataPinjamMesin")) || [];
let editId = null;

// ====================== FUNGSI FORMAT TANGGAL ======================
function formatTanggalIndo(tanggalInput) {
    if (!tanggalInput) return "-";
    let tanggal;
    if (tanggalInput.includes('/')) {
        const bagian = tanggalInput.split(' ')[0];
        return bagian;
    }
    if (tanggalInput.includes(' ')) {
        tanggal = new Date(tanggalInput);
    } else {
        const [tahun, bulan, hari] = tanggalInput.split('-');
        tanggal = new Date(tahun, bulan - 1, hari);
    }
    if (isNaN(tanggal.getTime())) return tanggalInput;
    const hari = String(tanggal.getDate()).padStart(2, '0');
    const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
    const tahun = tanggal.getFullYear();
    return `${hari}/${bulan}/${tahun}`;
}

// ✅ FUNGSI FORMAT TANGGAL + JAM WIB YANG DIPERBAIKI
function formatTanggalJamWIB(tglInput = new Date()) {
    let tgl;
    if (typeof tglInput === 'string' && !tglInput.includes('T') && !tglInput.includes(' ')) {
        const [tahun, bulan, hari] = tglInput.split('-');
        tgl = new Date(tahun, bulan - 1, hari, new Date().getHours(), new Date().getMinutes(), new Date().getSeconds());
    } else {
        tgl = new Date(tglInput);
    }
    
    if (isNaN(tgl.getTime())) return "-";
    
    const opsi = {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
        hour12: false
    };
    
    return tgl.toLocaleString('id-ID', opsi).replace(/:/g, '.');
}

// ====================== LOGIN ======================
function cekStatusLogin() {
    const status = localStorage.getItem("statusLogin");
    if (status === "masuk") {
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("mainPage").classList.remove("hidden");
        tampilkanHalaman('dataAset');
    } else {
        document.getElementById("loginPage").classList.remove("hidden");
        document.getElementById("mainPage").classList.add("hidden");
    }
}

function login() {
    const user = document.getElementById("username").value.trim();
    const pass = document.getElementById("password").value.trim();
    if (user === "admin" && pass === "admin123") {
        localStorage.setItem("statusLogin", "masuk");
        document.getElementById("loginPage").classList.add("hidden");
        document.getElementById("mainPage").classList.remove("hidden");
        tampilkanHalaman('dataAset');
    } else {
        alert("❌ Username atau Password salah!");
    }
}

function keluar() {
    localStorage.removeItem("statusLogin");
    document.getElementById("mainPage").classList.add("hidden");
    document.getElementById("loginPage").classList.remove("hidden");
    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

// ====================== NAVIGASI ======================
function tampilkanHalaman(id) {
    document.querySelectorAll(".halaman").forEach(el => el.classList.add("hidden"));
    document.getElementById(id).classList.remove("hidden");
    
    const hariIni = new Date().toISOString().split('T')[0];
    if(id === 'dataAset') tampilkanTabelAset();
    if(id === 'peminjaman') {
        tampilkanTabelPinjam();
        tutupFormPinjam();
        document.getElementById("tglPinjam").value = hariIni;
    }
    if(id === 'pengembalian') {
        tampilkanTabelKembali();
        tutupFormKembali();
        document.getElementById("tglKembali").value = hariIni;
    }
    if(id === 'laporan') tampilkanLaporanFilter();
}

// ====================== DATA ASET ======================
function bukaFormTambah() {
    editId = null;
    document.getElementById("judulForm").textContent = "Tambah Aset Mesin Baru";
    document.getElementById("kodeAset").value = "";
    document.getElementById("namaAset").value = "";
    document.getElementById("jenisMesin").value = "";
    document.getElementById("merk").value = "";
    document.getElementById("nomorMesin").value = "";
    document.getElementById("kapasitas").value = "";
    document.getElementById("kondisi").value = "Baik";
    document.getElementById("lokasi").value = "";
    document.getElementById("jumlah").value = "1";
    tampilkanHalaman('formAset');
}

function bukaFormEdit(id) {
    editId = id;
    const aset = dataAset.find(a => a.id === id);
    document.getElementById("judulForm").textContent = "Edit Data Aset Mesin";
    document.getElementById("kodeAset").value = aset.kodeAset;
    document.getElementById("namaAset").value = aset.namaAset;
    document.getElementById("jenisMesin").value = aset.jenisMesin;
    document.getElementById("merk").value = aset.merk;
    document.getElementById("nomorMesin").value = aset.nomorMesin || "";
    document.getElementById("kapasitas").value = aset.kapasitas || "";
    document.getElementById("kondisi").value = aset.kondisi;
    document.getElementById("lokasi").value = aset.lokasi || "";
    document.getElementById("jumlah").value = aset.jumlahTotal;
    tampilkanHalaman('formAset');
}

function tutupForm() {
    tampilkanHalaman('dataAset');
}

function simpanAset() {
    const kode = document.getElementById("kodeAset").value.trim();
    const nama = document.getElementById("namaAset").value.trim();
    const jenis = document.getElementById("jenisMesin").value.trim();
    const merk = document.getElementById("merk").value.trim();
    const nomorMesin = document.getElementById("nomorMesin").value.trim();
    const kapasitas = document.getElementById("kapasitas").value.trim();
    const kondisi = document.getElementById("kondisi").value;
    const lokasi = document.getElementById("lokasi").value.trim();
    const jumlah = parseInt(document.getElementById("jumlah").value);
    const tglInput = formatTanggalJamWIB();

    if(!kode || !nama || !jenis || !merk || !jumlah || jumlah < 1) {
        alert("❌ Kolom Kode, Nama, Jenis, Merk, dan Jumlah wajib diisi!");
        return;
    }

    if(!editId) {
        const cekKode = dataAset.some(a => a.kodeAset.toLowerCase() === kode.toLowerCase());
        if(cekKode) { alert("❌ Kode aset sudah terdaftar!"); return; }
        
        dataAset.push({
            id: Date.now(),
            kodeAset: kode,
            namaAset: nama,
            jenisMesin: jenis,
            merk: merk,
            nomorMesin: nomorMesin,
            kapasitas: kapasitas,
            kondisi: kondisi,
            lokasi: lokasi,
            jumlahTotal: jumlah,
            dipinjam: 0,
            tglInput: tglInput
        });
    } else {
        const idx = dataAset.findIndex(a => a.id === editId);
        if(jumlah < dataAset[idx].dipinjam) {
            alert("❌ Jumlah tidak boleh kurang dari yang sedang dipinjam!");
            return;
        }
        dataAset[idx] = {
            ...dataAset[idx],
            kodeAset: kode, namaAset: nama, jenisMesin: jenis, merk: merk,
            nomorMesin: nomorMesin, kapasitas: kapasitas, kondisi: kondisi,
            lokasi: lokasi, jumlahTotal: jumlah
        };
    }

    simpanKeStorage();
    alert("✅ Data aset berhasil disimpan!");
    tutupForm();
}

function hapusAset(id) {
    if(!confirm("⚠️ Yakin ingin menghapus data aset ini?")) return;
    const adaPinjam = dataPinjam.some(p => p.idAset === id && p.status === "Belum Selesai");
    if(adaPinjam) { alert("❌ Tidak bisa dihapus! Aset sedang dipinjam."); return; }
    dataAset = dataAset.filter(a => a.id !== id);
    dataPinjam = dataPinjam.filter(p => p.idAset !== id);
    simpanKeStorage();
    tampilkanTabelAset();
}

function tampilkanTabelAset(data = dataAset) {
    const tbody = document.getElementById("isiTabel");
    tbody.innerHTML = "";
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="15" style="text-align:center; color:#666;">Belum ada data aset</td></tr>`;
        return;
    }
    data.forEach((aset, i) => {
        const sisa = aset.jumlahTotal - aset.dipinjam;
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i+1}</td>
            <td>${aset.tglInput}</td>
            <td>${aset.kodeAset}</td>
            <td>${aset.namaAset}</td>
            <td>${aset.jenisMesin}</td>
            <td>${aset.merk}</td>
            <td>${aset.nomorMesin || "-"}</td>
            <td>${aset.kapasitas || "-"}</td>
            <td>${aset.jumlahTotal}</td>
            <td>${aset.dipinjam}</td>
            <td>${sisa}</td>
            <td>${aset.kondisi}</td>
            <td>${aset.lokasi || "-"}</td>
            <td>
                <button class="btn btn-cetak-item" onclick="cetakItemAset(${aset.id})">Cetak</button>
                <button class="btn btn-edit" onclick="bukaFormEdit(${aset.id})">Edit</button>
                <button class="btn btn-hapus" onclick="hapusAset(${aset.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function cariAset() {
    const kunci = document.getElementById("kataKunci").value.toLowerCase();
    const hasil = dataAset.filter(a => 
        a.kodeAset.toLowerCase().includes(kunci) ||
        a.namaAset.toLowerCase().includes(kunci) ||
        a.merk.toLowerCase().includes(kunci) ||
        a.nomorMesin.toLowerCase().includes(kunci)
    );
    tampilkanTabelAset(hasil);
}

// ====================== PEMINJAMAN ======================
function bukaFormPinjam() {
    document.getElementById("formPinjam").classList.remove("hidden");
    muatAsetTersedia();
}

function tutupFormPinjam() {
    document.getElementById("formPinjam").classList.add("hidden");
}

function muatAsetTersedia() {
    const select = document.getElementById("pilihAset");
    select.innerHTML = '<option value="">-- Pilih Barang Tersedia --</option>';
    dataAset.forEach(a => {
        const sisa = a.jumlahTotal - a.dipinjam;
        if(sisa > 0) {
            const opt = document.createElement("option");
            opt.value = a.id;
            opt.textContent = `${a.kodeAset} - ${a.namaAset} | Sisa: ${sisa}`;
            select.appendChild(opt);
        }
    });
}

function tampilkanInfoAset() {
    const id = parseInt(document.getElementById("pilihAset").value);
    if(!id) return;
    const aset = dataAset.find(a => a.id === id);
    const sisa = aset.jumlahTotal - aset.dipinjam;
    document.getElementById("infoNamaAset").value = `${aset.namaAset} | Merk: ${aset.merk}`;
    document.getElementById("infoStok").value = sisa;
    document.getElementById("jmlPinjam").max = sisa;
}

function prosesPinjam() {
    const idAset = parseInt(document.getElementById("pilihAset").value);
    const peminjam = document.getElementById("namaPeminjam").value.trim();
    const keperluan = document.getElementById("keperluan").value.trim();
    const jumlah = parseInt(document.getElementById("jmlPinjam").value);
    const tgl = document.getElementById("tglPinjam").value;

    if(!idAset || !peminjam || !keperluan || !jumlah || !tgl) {
        alert("❌ Semua kolom wajib diisi!");
        return;
    }

    const aset = dataAset.find(a => a.id === idAset);
    const sisa = aset.jumlahTotal - aset.dipinjam;
    if(jumlah > sisa) { alert(`❌ Stok tidak cukup! Maksimal: ${sisa}`); return; }

    const tglPinjamLengkap = formatTanggalJamWIB(tgl);

    dataPinjam.push({
        id: Date.now(),
        idAset: idAset,
        kodeAset: aset.kodeAset,
        namaAset: aset.namaAset,
        peminjam: peminjam,
        keperluan: keperluan,
        jumlah: jumlah,
        sudahKembali: 0,
        tglPinjam: tglPinjamLengkap,
        status: "Belum Selesai",
        kondisiKembali: null,
        tglKembali: null
    });

    aset.dipinjam += jumlah;
    simpanKeStorage();
    alert("✅ Peminjaman berhasil disimpan!");
    tampilkanHalaman('peminjaman');
}

function tampilkanTabelPinjam(data = dataPinjam) {
    const tbody = document.getElementById("isiTabelPinjam");
    tbody.innerHTML = "";
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:#666;">Belum ada data peminjaman</td></tr>`;
        return;
    }
    data.forEach((p, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i+1}</td>
            <td>${p.tglPinjam}</td>
            <td>${p.kodeAset}</td>
            <td>${p.namaAset}</td>
            <td>${p.peminjam}</td>
            <td>${p.keperluan}</td>
            <td>${p.jumlah}</td>
            <td>${p.sudahKembali}</td>
            <td>${p.status}</td>
            <td>
                <button class="btn btn-cetak-item" onclick="cetakItemPinjam(${p.id})">Cetak</button>
                <button class="btn btn-hapus" onclick="hapusPinjam(${p.id})">Hapus</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function cariDataPinjam() {
    const kunci = document.getElementById("cariPinjam").value.toLowerCase();
    const hasil = dataPinjam.filter(p => 
        p.kodeAset.toLowerCase().includes(kunci) ||
        p.namaAset.toLowerCase().includes(kunci) ||
        p.peminjam.toLowerCase().includes(kunci) ||
        p.keperluan.toLowerCase().includes(kunci)
    );
    tampilkanTabelPinjam(hasil);
}

function hapusPinjam(id) {
    if(!confirm("⚠️ Yakin hapus data peminjaman?")) return;
    const pinjam = dataPinjam.find(p => p.id === id);
    const aset = dataAset.find(a => a.id === pinjam.idAset);
    aset.dipinjam -= (pinjam.jumlah - pinjam.sudahKembali);
    dataPinjam = dataPinjam.filter(p => p.id !== id);
    simpanKeStorage();
    tampilkanTabelPinjam();
}

// ====================== PENGEMBALIAN ======================
function bukaFormKembali() {
    document.getElementById("formKembali").classList.remove("hidden");
    muatPeminjamanAktif();
}

function tutupFormKembali() {
    document.getElementById("formKembali").classList.add("hidden");
}

function muatPeminjamanAktif() {
    const select = document.getElementById("pilihPinjam");
    select.innerHTML = '<option value="">-- Pilih Barang yang Dipinjam --</option>';
    dataPinjam.forEach(p => {
        if(p.status === "Belum Selesai") {
            const sisa = p.jumlah - p.sudahKembali;
            const opt = document.createElement("option");
            opt.value = p.id;
            opt.textContent = `${p.kodeAset} - ${p.namaAset} | Peminjam: ${p.peminjam} | Sisa: ${sisa}`;
            select.appendChild(opt);
        }
    });
}

function tampilkanInfoPinjam() {
    const id = parseInt(document.getElementById("pilihPinjam").value);
    if(!id) return;
    const pinjam = dataPinjam.find(p => p.id === id);
    const sisa = pinjam.jumlah - pinjam.sudahKembali;
    document.getElementById("infoDetailPinjam").value = `${pinjam.kodeAset} - ${pinjam.namaAset}`;
    document.getElementById("infoPeminjam").value = pinjam.peminjam;
    document.getElementById("infoKeperluan").value = pinjam.keperluan;
    document.getElementById("infoJumlahPinjam").value = sisa;
    document.getElementById("jmlKembali").max = sisa;
}

function prosesKembali() {
    const idPinjam = parseInt(document.getElementById("pilihPinjam").value);
    const jumlahKembali = parseInt(document.getElementById("jmlKembali").value);
    const kondisi = document.getElementById("kondisiKembali").value;
    const keterangan = document.getElementById("keteranganKembali").value.trim();
    const tglKembali = document.getElementById("tglKembali").value;

    if(!idPinjam || !jumlahKembali || !kondisi || !tglKembali) {
        alert("❌ Semua kolom wajib diisi!");
        return;
    }

    const pinjam = dataPinjam.find(p => p.id === idPinjam);
    if(jumlahKembali > pinjam.jumlah - pinjam.sudahKembali) {
        alert("❌ Jumlah melebihi yang dipinjam!");
        return;
    }

    pinjam.sudahKembali += jumlahKembali;
    pinjam.kondisiKembali = kondisi;
    pinjam.keterangan = keterangan;
    pinjam.tglKembali = formatTanggalJamWIB(tglKembali);
    if(pinjam.sudahKembali === pinjam.jumlah) pinjam.status = "Selesai";

    const aset = dataAset.find(a => a.id === pinjam.idAset);
    aset.dipinjam -= jumlahKembali;

    simpanKeStorage();
    alert("✅ Pengembalian berhasil disimpan!");
    tampilkanHalaman('pengembalian');
}

function tampilkanTabelKembali(data = dataPinjam) {
    const tbody = document.getElementById("isiTabelKembali");
    tbody.innerHTML = "";
    if(data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; color:#666;">Belum ada data pengembalian</td></tr>`;
        return;
    }
    data.forEach((p, i) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${i+1}</td>
            <td>${p.tglPinjam}</td>
            <td>${p.tglKembali || "-"}</td>
            <td>${p.kodeAset}</td>
            <td>${p.namaAset}</td>
            <td>${p.peminjam}</td>
            <td>${p.keperluan}</td>
            <td>${p.jumlah}</td>
            <td>${p.sudahKembali}</td>
            <td>${p.kondisiKembali || "-"}</td>
            <td>${p.status}</td>
            <td>
                <button class="btn btn-cetak-item" onclick="cetakItemKembali(${p.id})">Cetak</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function cariDataKembali() {
    const kunci = document.getElementById("cariKembali").value.toLowerCase();
    const hasil = dataPinjam.filter(p => 
        p.kodeAset.toLowerCase().includes(kunci) ||
        p.namaAset.toLowerCase().includes(kunci) ||
        p.peminjam.toLowerCase().includes(kunci)
    );
    tampilkanTabelKembali(hasil);
}

// ====================== LAPORAN & CETAK ======================
function parseTanggalDariString(tglStr) {
    if (!tglStr) return null;
    const bagian = tglStr.split(' ');
    const tgl = bagian[0].split('/');
    if (tgl.length === 3) {
        const hari = parseInt(tgl[0]);
        const bulan = parseInt(tgl[1]) - 1;
        const tahun = parseInt(tgl[2]);
        if (bagian.length > 1) {
            const jam = bagian[1].split('.');
            return new Date(tahun, bulan, hari, parseInt(jam[0]), parseInt(jam[1]), parseInt(jam[2] || 0));
        }
        return new Date(tahun, bulan, hari, 23, 59, 59);
    }
    return null;
}

function ambilDataFilter(dataArray) {
    const tglMulai = document.getElementById("tglMulai").value;
    const tglSampai = document.getElementById("tglSampai").value;

    if (!tglMulai && !tglSampai) return dataArray;

    const tglAwal = tglMulai ? new Date(tglMulai) : new Date("1970-01-01");
    const tglAkhir = tglSampai ? new Date(tglSampai) : new Date("2099-12-31");
    tglAkhir.setHours(23, 59, 59);

    return dataArray.filter(item => {
        let tglData;
        if (item.tglInput) {
            tglData = parseTanggalDariString(item.tglInput);
        } else if (item.tglPinjam) {
            tglData = parseTanggalDariString(item.tglPinjam);
        } else if (item.tglKembali) {
            tglData = parseTanggalDariString(item.tglKembali);
        }
        if (!tglData || isNaN(tglData.getTime())) return false;
        return tglData >= tglAwal && tglData <= tglAkhir;
    });
}

function teksPeriode() {
    const tglMulai = document.getElementById("tglMulai").value;
    const tglSampai = document.getElementById("tglSampai").value;
    const mulai = tglMulai ? formatTanggalIndo(tglMulai) : "Semua Tanggal";
    const selesai = tglSampai ? formatTanggalIndo(tglSampai) : "Sekarang";
    return `Periode: ${mulai} s/d ${selesai}`;
}

function filterData(tglMulai, tglSelesai, data) {
    if(!tglMulai && !tglSelesai) return data;
    const mulai = tglMulai ? new Date(tglMulai.split('/').reverse().join('-')) : new Date("1970-01-01");
    const selesai = tglSelesai ? new Date(tglSelesai.split('/').reverse().join('-')) : new Date("2099-12-31");
    return data.filter(item => {
        const tglStr = item.tglInput || item.tglPinjam;
        const tgl = parseTanggalDariString(tglStr);
        return tgl && tgl >= mulai && tgl <= selesai;
    });
}

function tampilkanLaporanFilter() {
    const tglMulai = document.getElementById("tglMulai").value;
    const tglSelesai = document.getElementById("tglSampai").value;
    const jenis = document.getElementById("jenisLaporan")?.value || "aset";
    const tbody = document.getElementById("isiLaporan");
    const header = document.getElementById("headerLaporan");

    let dataFilter;
    let headerRow;

    if(jenis === "aset") {
        const tglMulaiFormatted = tglMulai ? formatTanggalIndo(tglMulai) : "";
        const tglSelesaiFormatted = tglSelesai ? formatTanggalIndo(tglSelesai) : "";
        dataFilter = filterData(tglMulaiFormatted, tglSelesaiFormatted, dataAset);
        headerRow = `<tr>
            <th>No</th><th>Tanggal Input</th><th>Kode</th><th>Nama</th><th>Jenis</th><th>Merk</th><th>Nomor Seri</th><th>Kapasitas</th><th>Jumlah Total</th><th>Dipinjam</th><th>Sisa Stok</th><th>Kondisi</th><th>Lokasi</th>
        </tr>`;
        tbody.innerHTML = dataFilter.map((a,i) => `<tr>
            <td>${i+1}</td><td>${a.tglInput}</td><td>${a.kodeAset}</td><td>${a.namaAset}</td><td>${a.jenisMesin}</td><td>${a.merk}</td><td>${a.nomorMesin || "-"}</td><td>${a.kapasitas || "-"}</td><td>${a.jumlahTotal}</td><td>${a.dipinjam}</td><td>${a.jumlahTotal - a.dipinjam}</td><td>${a.kondisi}</td><td>${a.lokasi || "-"}</td>
        </tr>`).join("");
    } 
    else if(jenis === "peminjaman") {
        const tglMulaiFormatted = tglMulai ? formatTanggalIndo(tglMulai) : "";
        const tglSelesaiFormatted = tglSelesai ? formatTanggalIndo(tglSelesai) : "";
        dataFilter = filterData(tglMulaiFormatted, tglSelesaiFormatted, dataPinjam);
        headerRow = `<tr>
            <th>No</th><th>Tanggal Pinjam</th><th>Kode</th><th>Nama Barang</th><th>Peminjam</th><th>Keperluan</th><th>Jumlah Dipinjam</th><th>Sudah Kembali</th><th>Status</th>
        </tr>`;
        tbody.innerHTML = dataFilter.map((p,i) => `<tr>
            <td>${i+1}</td><td>${p.tglPinjam}</td><td>${p.kodeAset}</td><td>${p.namaAset}</td><td>${p.peminjam}</td><td>${p.keperluan}</td><td>${p.jumlah}</td><td>${p.sudahKembali}</td><td>${p.status}</td>
        </tr>`).join("");
    }
    else if(jenis === "pengembalian") {
        const tglMulaiFormatted = tglMulai ? formatTanggalIndo(tglMulai) : "";
        const tglSelesaiFormatted = tglSelesai ? formatTanggalIndo(tglSelesai) : "";
        dataFilter = filterData(tglMulaiFormatted, tglSelesaiFormatted, dataPinjam.filter(p => p.tglKembali));
        headerRow = `<tr>
            <th>No</th><th>Tanggal Pinjam</th><th>Tanggal Kembali</th><th>Kode</th><th>Nama Barang</th><th>Peminjam</th><th>Keperluan</th><th>Jumlah Kembali</th><th>Kondisi</th><th>Keterangan</th>
        </tr>`;
        tbody.innerHTML = dataFilter.map((p,i) => `<tr>
            <td>${i+1}</td><td>${p.tglPinjam}</td><td>${p.tglKembali || "-"}</td><td>${p.kodeAset}</td><td>${p.namaAset}</td><td>${p.peminjam}</td><td>${p.keperluan}</td><td>${p.sudahKembali}</td><td>${p.kondisiKembali || "-"}</td><td>${p.keterangan || "-"}</td>
        </tr>`).join("");
    }
    else {
        headerRow = `<tr><th colspan="11" style="text-align:center;">Pilih jenis laporan terlebih dahulu</th></tr>`;
        tbody.innerHTML = "";
    }

    header.innerHTML = headerRow;
    if(tbody.innerHTML === "") tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;">Tidak ada data sesuai filter yang dipilih</td></tr>`;
}

// --- CETAK PER ITEM ---
// --- CETAK PER ITEM DENGAN FORMAT TABEL RAPI ---
function cetakItemAset(id) {
    const aset = dataAset.find(a => a.id === id);
    if(!aset) return;
    
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DATA ASET MESIN", 105, 20, {align:"center"});
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 105, 28, {align:"center"});
    doc.line(20, 35, 190, 35); // Garis pemisah
    
    // Data dalam bentuk tabel
    const dataTabel = [
        ["Kode Aset", aset.kodeAset],
        ["Nama Aset", aset.namaAset],
        ["Jenis Mesin", aset.jenisMesin],
        ["Merk", aset.merk],
        ["Nomor Mesin", aset.nomorMesin || "-"],
        ["Kapasitas", aset.kapasitas || "-"],
        ["Jumlah Total", aset.jumlahTotal],
        ["Sedang Dipinjam", aset.dipinjam],
        ["Sisa Stok", aset.jumlahTotal - aset.dipinjam],
        ["Kondisi", aset.kondisi],
        ["Lokasi", aset.lokasi || "-"],
        ["Tanggal Input", aset.tglInput]
    ];

    doc.autoTable({
        startY: 42,
        body: dataTabel,
        theme: 'grid',
        styles: {
            fontSize: 11,
            cellPadding: 6,
            lineWidth: 0.2,
            lineColor: [80, 80, 80]
        },
        columnStyles: {
            0: {
                fontStyle: 'bold',
                fillColor: [240, 240, 240],
                cellWidth: 55
            },
            1: {
                cellWidth: 125
            }
        },
        margin: { left: 20, right: 20 }
    });
    
    // Tanda tangan
    const posY = doc.lastAutoTable.finalY + 15;
    doc.text("Mengetahui,", 145, posY);
    doc.text("Kepala Bagian", 145, posY + 40);
    doc.line(135, posY + 35, 175, posY + 35);

    doc.save(`Aset_${aset.kodeAset}_${formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-')}.pdf`);
}

function cetakItemPinjam(id) {
    const pinjam = dataPinjam.find(p => p.id === id);
    if(!pinjam) return;
    
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI PEMINJAMAN ASET", 105, 20, {align:"center"});
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 105, 28, {align:"center"});
    doc.line(20, 35, 190, 35);
    
    const dataTabel = [
        ["Tanggal Pinjam", pinjam.tglPinjam],
        ["Kode Aset", pinjam.kodeAset],
        ["Nama Aset", pinjam.namaAset],
        ["Nama Peminjam", pinjam.peminjam],
        ["Keperluan", pinjam.keperluan],
        ["Jumlah Dipinjam", pinjam.jumlah],
        ["Sudah Dikembalikan", pinjam.sudahKembali],
        ["Status", pinjam.status]
    ];

    doc.autoTable({
        startY: 42,
        body: dataTabel,
        theme: 'grid',
        styles: {
            fontSize: 11,
            cellPadding: 6,
            lineWidth: 0.2,
            lineColor: [80, 80, 80]
        },
        columnStyles: {
            0: {
                fontStyle: 'bold',
                fillColor: [240, 240, 240],
                cellWidth: 55
            },
            1: {
                cellWidth: 125
            }
        },
        margin: { left: 20, right: 20 }
    });

    const posY = doc.lastAutoTable.finalY + 15;
    doc.text("Peminjam,", 35, posY);
    doc.text("Yang Menyerahkan,", 145, posY);
    doc.line(25, posY + 35, 75, posY + 35);
    doc.line(135, posY + 35, 185, posY + 35);

    doc.save(`Pinjam_${pinjam.kodeAset}_${formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-')}.pdf`);
}

function cetakItemKembali(id) {
    const kembali = dataPinjam.find(p => p.id === id && p.tglKembali);
    if(!kembali) return;
    
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI PENGEMBALIAN ASET", 105, 20, {align:"center"});
    
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Tanggal Cetak: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 105, 28, {align:"center"});
    doc.line(20, 35, 190, 35);
    
    const dataTabel = [
        ["Tanggal Pinjam", kembali.tglPinjam],
        ["Tanggal Kembali", kembali.tglKembali],
        ["Kode Aset", kembali.kodeAset],
        ["Nama Aset", kembali.namaAset],
        ["Nama Peminjam", kembali.peminjam],
        ["Jumlah Dikembalikan", kembali.sudahKembali],
        ["Kondisi Saat Kembali", kembali.kondisiKembali || "-"],
        ["Keterangan", kembali.keterangan || "-"]
    ];

    doc.autoTable({
        startY: 42,
        body: dataTabel,
        theme: 'grid',
        styles: {
            fontSize: 11,
            cellPadding: 6,
            lineWidth: 0.2,
            lineColor: [80, 80, 80]
        },
        columnStyles: {
            0: {
                fontStyle: 'bold',
                fillColor: [240, 240, 240],
                cellWidth: 55
            },
            1: {
                cellWidth: 125
            }
        },
        margin: { left: 20, right: 20 }
    });

    const posY = doc.lastAutoTable.finalY + 15;
    doc.text("Yang Mengembalikan,", 35, posY);
    doc.text("Yang Menerima,", 145, posY);
    doc.line(25, posY + 35, 75, posY + 35);
    doc.line(135, posY + 35, 185, posY + 35);

    doc.save(`Kembali_${kembali.kodeAset}_${formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-')}.pdf`);
}

// --- CETAK LAPORAN ---
function cetakLaporanAsetPDF() {
    const dataFilter = ambilDataFilter(dataAset);
    if(dataFilter.length === 0) { alert("❌ Tidak ada data aset sesuai periode yang dipilih!"); return; }
    
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DATA ASET MESIN & PERALATAN", 148, 15, {align:"center"});
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teksPeriode(), 148, 22, {align:"center"});
    doc.text(`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 148, 28, {align:"center"});
    
    doc.autoTable({
        startY: 35,
        head: [["No","Tanggal Input","Kode Aset","Nama Aset","Jenis Mesin","Merk","Nomor Seri","Kapasitas","Jumlah Total","Dipinjam","Sisa Stok","Kondisi","Lokasi"]],
        body: dataFilter.map((a,i) => [
            i+1, a.tglInput, a.kodeAset, a.namaAset, a.jenisMesin || "-", a.merk || "-",
            a.nomorMesin || "-", a.kapasitas || "-", a.jumlahTotal || 0, a.dipinjam || 0,
            (a.jumlahTotal || 0) - (a.dipinjam || 0), a.kondisi || "-", a.lokasi || "-"
        ]),
        headStyles: {fillColor: [15,23,42], textColor: 255},
        styles: {fontSize: 8, cellPadding: 2},
        margin: {left:10, right:10}
    });
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    doc.save(`Laporan_Data_Aset_Periode_${tanggalFile}.pdf`);
}

function cetakLaporanPinjamPDF() {
    const dataFilter = ambilDataFilter(dataPinjam);
    if(dataFilter.length === 0) { alert("❌ Tidak ada data peminjaman sesuai periode yang dipilih!"); return; }
    
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DATA PEMINJAMAN ASET", 148, 15, {align:"center"});
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teksPeriode(), 148, 22, {align:"center"});
    doc.text(`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 148, 28, {align:"center"});
    
    doc.autoTable({
        startY: 35,
        head: [["No","Tanggal Pinjam","Kode Aset","Nama Barang","Peminjam","Keperluan","Jumlah Dipinjam","Sudah Kembali","Status"]],
        body: dataFilter.map((p,i) => [
            i+1, p.tglPinjam, p.kodeAset || "-", p.namaAset || "-", p.peminjam || "-", p.keperluan || "-",
            p.jumlah || 0, p.sudahKembali || 0, p.status || "-"
        ]),
        headStyles: {fillColor: [15,23,42], textColor: 255},
        styles: {fontSize: 9, cellPadding: 3},
        margin: {left:10, right:10}
    });
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    doc.save(`Laporan_Peminjaman_Aset_Periode_${tanggalFile}.pdf`);
}

function cetakLaporanKembaliPDF() {
    const semuaKembali = dataPinjam.filter(p => p.tglKembali);
    const dataFilter = ambilDataFilter(semuaKembali);
    if(dataFilter.length === 0) { alert("❌ Tidak ada data pengembalian sesuai periode yang dipilih!"); return; }
    
    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN DATA PENGEMBALIAN ASET", 148, 15, {align:"center"});
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teksPeriode(), 148, 22, {align:"center"});
    doc.text(`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 148, 28, {align:"center"});
    
    doc.autoTable({
        startY: 35,
        head: [["No","Tanggal Pinjam","Tanggal Kembali","Kode Aset","Nama Barang","Peminjam","Keperluan","Jumlah Pinjam","Jumlah Kembali","Kondisi","Keterangan"]],
        body: dataFilter.map((p,i) => [
            i+1, p.tglPinjam, p.tglKembali || "-", p.kodeAset || "-", p.namaAset || "-", p.peminjam || "-", p.keperluan || "-",
            p.jumlah || 0, p.sudahKembali || 0, p.kondisiKembali || "-", p.keterangan || "-"
        ]),
        headStyles: {fillColor: [15,23,42], textColor: 255},
        styles: {fontSize: 8, cellPadding: 2},
        margin: {left:10, right:10}
    });
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    doc.save(`Laporan_Pengembalian_Aset_Periode_${tanggalFile}.pdf`);
}

function cetakLaporanAsetExcel() {
    const dataFilter = ambilDataFilter(dataAset);
    if(dataFilter.length === 0) { alert("❌ Tidak ada data aset sesuai periode yang dipilih!"); return; }
    
    const header = ["No","Tanggal Input","Kode Aset","Nama Aset","Jenis Mesin","Merk","Nomor Seri","Kapasitas","Jumlah Total","Dipinjam","Sisa Stok","Kondisi","Lokasi"];
    const isi = dataFilter.map((a,i) => [
        i+1, a.tglInput, a.kodeAset, a.namaAset, a.jenisMesin || "-", a.merk || "-",
        a.nomorMesin || "-", a.kapasitas || "-", a.jumlahTotal || 0, a.dipinjam || 0,
        (a.jumlahTotal || 0) - (a.dipinjam || 0), a.kondisi || "-", a.lokasi || "-"
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ["LAPORAN DATA ASET MESIN & PERALATAN"],
        [teksPeriode()],
        [`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`],
        [],
        header,
        ...isi
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Data Aset");
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    XLSX.writeFile(wb, `Laporan_Data_Aset_Periode_${tanggalFile}.xlsx`);
}

function cetakLaporanPinjamExcel() {
    const dataFilter = ambilDataFilter(dataPinjam);
    if(dataFilter.length === 0) { alert("❌ Tidak ada data peminjaman sesuai periode yang dipilih!"); return; }
    
    const header = ["No","Tanggal Pinjam","Kode Aset","Nama Barang","Peminjam","Keperluan","Jumlah Dipinjam","Sudah Kembali","Status"];
    const isi = dataFilter.map((p,i) => [
        i+1, p.tglPinjam, p.kodeAset || "-", p.namaAset || "-", p.peminjam || "-", p.keperluan || "-",
        p.jumlah || 0, p.sudahKembali || 0, p.status || "-"
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ["LAPORAN DATA PEMINJAMAN ASET"],
        [teksPeriode()],
        [`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`],
        [],
        header,
        ...isi
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Data Peminjaman");
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    XLSX.writeFile(wb, `Laporan_Peminjaman_Aset_Periode_${tanggalFile}.xlsx`);
}

function cetakLaporanKembaliExcel() {
    const semuaKembali = dataPinjam.filter(p => p.tglKembali);
    const dataFilter = ambilDataFilter(semuaKembali);
    if(dataFilter.length === 0) { alert("❌ Tidak ada data pengembalian sesuai periode yang dipilih!"); return; }
    
    const header = ["No","Tanggal Pinjam","Tanggal Kembali","Kode Aset","Nama Barang","Peminjam","Keperluan","Jumlah Pinjam","Jumlah Kembali","Kondisi","Keterangan"];
    const isi = dataFilter.map((p,i) => [
        i+1, p.tglPinjam, p.tglKembali || "-", p.kodeAset || "-", p.namaAset || "-", p.peminjam || "-", p.keperluan || "-",
        p.jumlah || 0, p.sudahKembali || 0, p.kondisiKembali || "-", p.keterangan || "-"
    ]);
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet([
        ["LAPORAN DATA PENGEMBALIAN ASET"],
        [teksPeriode()],
        [`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`],
        [],
        header,
        ...isi
    ]);
    XLSX.utils.book_append_sheet(wb, ws, "Data Pengembalian");
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    XLSX.writeFile(wb, `Laporan_Pengembalian_Aset_Periode_${tanggalFile}.xlsx`);
}

function cetakSemuaDataPDF() {
    const dataAsetFilter = ambilDataFilter(dataAset || []);
    const dataPinjamFilter = ambilDataFilter(dataPinjam || []);
    const dataKembaliFilter = ambilDataFilter((dataPinjam || []).filter(p => p.tglKembali));

    if (dataAsetFilter.length === 0 && dataPinjamFilter.length === 0) {
        alert("❌ Tidak ada data aset atau peminjaman pada periode yang dipilih!");
        return;
    }

    const {jsPDF} = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    let posY = 15;

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("LAPORAN KESELURUHAN PENCATATAN ASET", 148, posY, {align: "center"});
    posY += 7;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(teksPeriode(), 148, posY, {align: "center"});
    posY += 6;
    doc.text(`Dicetak pada: ${formatTanggalIndo(new Date().toISOString().split('T')[0])}`, 148, posY, {align: "center"});
    posY += 12;
    
    // Bagian Data Aset
    if (dataAsetFilter.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("1. DATA ASET", 14, posY);
        posY += 6;
    
        doc.autoTable({
            startY: posY,
            head: [["No","Tanggal Input","Kode Aset","Nama Aset","Jenis","Merk","Jumlah","Dipinjam","Sisa","Kondisi","Lokasi"]],
            body: dataAsetFilter.map((a,i) => [
                i+1, a.tglInput, a.kodeAset, a.namaAset, a.jenisMesin || "-", a.merk || "-",
                a.jumlahTotal || 0, a.dipinjam || 0, (a.jumlahTotal || 0) - (a.dipinjam || 0),
                a.kondisi || "-", a.lokasi || "-"
            ]),
            headStyles: {fillColor: [41, 128, 185], textColor: 255},
            styles: {fontSize: 7, cellPadding: 2},
            margin: {left:10, right:10}
        });
        posY = doc.lastAutoTable.finalY + 10;
    }
    
    // Bagian Data Peminjaman
    if (dataPinjamFilter.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("2. DATA PEMINJAMAN", 14, posY);
        posY += 6;
    
        doc.autoTable({
            startY: posY,
            head: [["No","Tanggal Pinjam","Kode Aset","Nama Barang","Peminjam","Keperluan","Jumlah","Sudah Kembali","Status"]],
            body: dataPinjamFilter.map((p,i) => [
                i+1, p.tglPinjam, p.kodeAset || "-", p.namaAset || "-", p.peminjam || "-",
                p.keperluan || "-", p.jumlah || 0, p.sudahKembali || 0, p.status || "-"
            ]),
            headStyles: {fillColor: [39, 174, 96], textColor: 255},
            styles: {fontSize: 7, cellPadding: 2},
            margin: {left:10, right:10}
        });
        posY = doc.lastAutoTable.finalY + 10;
    }
    
    // Bagian Data Pengembalian
    if (dataKembaliFilter.length > 0) {
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("3. DATA PENGEMBALIAN", 14, posY);
        posY += 6;
    
        doc.autoTable({
            startY: posY,
            head: [["No","Tanggal Pinjam","Tanggal Kembali","Kode Aset","Nama Barang","Peminjam","Jumlah","Kondisi","Keterangan"]],
            body: dataKembaliFilter.map((p,i) => [
                i+1, p.tglPinjam, p.tglKembali || "-", p.kodeAset || "-", p.namaAset || "-",
                p.peminjam || "-", p.sudahKembali || 0, p.kondisiKembali || "-", p.keterangan || "-"
            ]),
            headStyles: {fillColor: [142, 68, 173], textColor: 255},
            styles: {fontSize: 7, cellPadding: 2},
            margin: {left:10, right:10}
        });
    }
    
    const tanggalFile = formatTanggalIndo(new Date().toISOString().split('T')[0]).replace(/\//g, '-');
    doc.save(`Laporan_Keseluruhan_Aset_Periode_${tanggalFile}.pdf`);
    }
    
    function cetakSemuaDataExcel() {
        const dataAsetFilter = ambilDataFilter(dataAset || []);
        const dataPinjamFilter = ambilDataFilter(dataPinjam || []);
        const dataKembaliFilter = ambilDataFilter((dataPinjam || []).filter(p => p.tglKembali));
    
        if (dataAsetFilter.length === 0 && dataPinjamFilter.length === 0) {
            alert("❌ Tidak ada data aset atau peminjaman pada periode yang dipilih!");
            return;
        }
    
        const wb = XLSX.utils.book_new();
        const tanggalCetak = formatTanggalIndo(new Date().toISOString().split('T')[0]);
        const teksPeriodeStr = teksPeriode();
    
        // Buat satu lembar utama seperti contoh
        const kontenUtama = [
            ["LAPORAN KESELURUHAN PENCATATAN ASET MESIN"],
            [teksPeriodeStr],
            [`Dicetak pada: ${tanggalCetak}`],
            []
        ];
    
        // --------------------------
        // BAGIAN 1: DATA ASET
        // --------------------------
        if (dataAsetFilter.length > 0) {
            kontenUtama.push(["1. DATA ASET"]);
            kontenUtama.push([]);
            kontenUtama.push([
                "No", "Tanggal Input", "Kode Aset", "Nama Aset", "Jenis Mesin", "Merk", 
                "Nomor Mesin", "Kapasitas", "Jumlah Total", "Dipinjam", "Sisa Stok", "Kondisi", "Lokasi"
            ]);
    
            dataAsetFilter.forEach((a, i) => {
                kontenUtama.push([
                    i + 1,
                    a.tglInput || "-",
                    a.kodeAset || "-",
                    a.namaAset || "-",
                    a.jenisMesin || "-",
                    a.merk || "-",
                    a.nomorMesin || "-",
                    a.kapasitas || "-",
                    a.jumlahTotal || 0,
                    a.dipinjam || 0,
                    (a.jumlahTotal || 0) - (a.dipinjam || 0),
                    a.kondisi || "-",
                    a.lokasi || "-"
                ]);
            });
            kontenUtama.push([]);
        }
    
        // --------------------------
        // BAGIAN 2: DATA PEMINJAMAN
        // --------------------------
        if (dataPinjamFilter.length > 0) {
            kontenUtama.push(["2. DATA PEMINJAMAN"]);
            kontenUtama.push([]);
            kontenUtama.push([
                "No", "Tanggal Pinjam", "Kode Aset", "Nama Barang", "Peminjam", 
                "Keperluan", "Jumlah Dipinjam", "Sudah Kembali", "Status"
            ]);
    
            dataPinjamFilter.forEach((p, i) => {
                kontenUtama.push([
                    i + 1,
                    p.tglPinjam || "-",
                    p.kodeAset || "-",
                    p.namaAset || "-",
                    p.peminjam || "-",
                    p.keperluan || "-",
                    p.jumlah || 0,
                    p.sudahKembali || 0,
                    p.status || "-"
                ]);
            });
            kontenUtama.push([]);
        }
    
        // --------------------------
        // BAGIAN 3: DATA PENGEMBALIAN
        // --------------------------
        if (dataKembaliFilter.length > 0) {
            kontenUtama.push(["3. DATA PENGEMBALIAN"]);
            kontenUtama.push([]);
            kontenUtama.push([
                "No", "Tanggal Pinjam", "Tanggal Kembali", "Kode Aset", "Nama Barang", 
                "Peminjam", "Keperluan", "Jumlah Dikembalikan", "Kondisi", "Keterangan"
            ]);
    
            dataKembaliFilter.forEach((p, i) => {
                kontenUtama.push([
                    i + 1,
                    p.tglPinjam || "-",
                    p.tglKembali || "-",
                    p.kodeAset || "-",
                    p.namaAset || "-",
                    p.peminjam || "-",
                    p.keperluan || "-",
                    p.sudahKembali || 0,
                    p.kondisiKembali || "-",
                    p.keterangan || "-"
                ]);
            });
        }
    
        // Buat worksheet dari semua konten
        const ws = XLSX.utils.aoa_to_sheet(kontenUtama);
    
        // Atur lebar kolom agar rapi
        ws['!cols'] = [
            { wch: 4 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 14 }, { wch: 12 },
            { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 18 }
        ];
    
        // Tambahkan ke workbook
        XLSX.utils.book_append_sheet(wb, ws, "LAPORAN KESELURUHAN");
    
        // Simpan file
        const tanggalFile = tanggalCetak.replace(/\//g, '-');
        XLSX.writeFile(wb, `Laporan_Keseluruhan_Aset_Periode_${tanggalFile}.xlsx`);
    }
    // ====================== PENYIMPANAN DATA ======================
    function simpanKeStorage() {
        localStorage.setItem("dataAsetMesin", JSON.stringify(dataAset));
        localStorage.setItem("dataPinjamMesin", JSON.stringify(dataPinjam));
    }
    
    // ====================== INISIALISASI AWAL ======================
    window.onload = function() {
        cekStatusLogin();
        tampilkanHalaman('dataAset');
    };