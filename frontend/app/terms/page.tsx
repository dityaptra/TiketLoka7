import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function TermsAndConditions() {
  // Gunakan tanggal statis atau ambil dari database/config untuk menghindari Error Hydration Mismatch
  const lastUpdated = "19 Desember 2025"; 

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Container Utama */}
      <div className="max-w-5xl mx-auto px-6 sm:px-8 py-12">
        
        {/* Header: Logo & Judul */}
        <div className="text-center mb-12 border-b border-gray-200 pb-8">
          <div className="flex justify-center mb-6">
            <div className="relative w-40 h-12">
               {/* Pastikan file logo.png ada di folder public */}
               <Image 
                 src="/images/logonama3.png" 
                 alt="Logo TiketLoka" 
                 fill
                 className="object-contain"
                 priority
               />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 uppercase tracking-wide">
            Syarat dan Ketentuan Penggunaan
          </h1>
          <p className="text-sm text-gray-500 mt-3 italic">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>

        {/* Konten Dokumen */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-justify">
          
          {/* Paragraf Pembuka */}
          <section>
            <p className="mb-4">
              Selamat datang di situs web dan aplikasi <strong>TiketLoka</strong> (&quot;Situs&quot;). Situs ini dikelola oleh PT TiketLoka Indonesia (&quot;kami&quot;).
            </p>
            <p>
              Dengan mengakses, mendaftar, atau melakukan transaksi di Situs kami, Anda (&quot;Pengguna&quot; atau &quot;Anda&quot;) setuju untuk tunduk dan terikat pada Syarat dan Ketentuan ini. Jika Anda tidak setuju dengan sebagian atau seluruh isi Syarat dan Ketentuan ini, mohon untuk tidak melanjutkan penggunaan layanan kami.
            </p>
          </section>

          {/* 1. Layanan Kami */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. LAYANAN KAMI</h2>
            <ol className="list-decimal pl-5 space-y-3 marker:font-bold">
              <li>
                TiketLoka menyediakan platform online yang memungkinkan Anda untuk mencari, memesan, dan membeli tiket untuk berbagai layanan wisata dan hiburan (&quot;Produk&quot;), termasuk namun tidak terbatas pada:
                <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2 text-gray-700">
                  <li><strong>Tiket Atraksi:</strong> Taman hiburan, museum, galeri seni, dan tempat wisata alam.</li>
                  <li><strong>Tiket Event:</strong> Konser musik, festival budaya, seminar, dan pameran.</li>
                  <li><strong>Tur & Aktivitas:</strong> Paket tur harian, aktivitas olahraga air, dan kelas workshop.</li>
                </ol>
              </li>
              <li>
                Kami bertindak sebagai agen resmi yang bekerjasama dengan mitra penyedia layanan (&quot;Mitra Vendor&quot;). Kami tidak mengoperasikan layanan wisata tersebut secara langsung, kecuali dinyatakan lain.
              </li>
            </ol>
          </section>

          {/* 2. Pemesanan & Pembayaran */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. PEMESANAN DAN PEMBAYARAN</h2>
            <ol className="list-decimal pl-5 space-y-3 marker:font-bold">
              <li>
                <strong>Konfirmasi Pemesanan:</strong> Pemesanan Anda dianggap sah hanya setelah Anda menerima email konfirmasi atau E-Ticket dari TiketLoka setelah pembayaran berhasil diverifikasi.
              </li>
              <li>
                <strong>Harga:</strong> Harga yang tertera dapat berubah sewaktu-waktu sebelum pemesanan selesai. Harga total mencakup harga tiket, pajak pemerintah, dan biaya layanan aplikasi (jika ada).
              </li>
              <li>
                <strong>Metode Pembayaran:</strong> Kami menerima pembayaran melalui transfer bank, kartu kredit/debit, dan dompet digital (E-Wallet). Segala biaya administrasi bank ditanggung oleh Pengguna.
              </li>
            </ol>
          </section>

          {/* 3. E-Ticket & Penukaran */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. E-TICKET DAN PENUKARAN</h2>
            <ol className="list-decimal pl-5 space-y-3 marker:font-bold">
              <li>
                E-Ticket yang diterbitkan bersifat rahasia. Anda bertanggung jawab menjaga keamanan kode booking atau QR Code yang tertera.
              </li>
              <li>
                Saat penukaran tiket di lokasi wisata (redeem), Anda wajib menunjukkan:
                <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2 text-gray-700">
                  <li>E-Ticket yang valid (cetak atau digital melalui aplikasi).</li>
                  <li>Kartu identitas (KTP/Paspor) yang sesuai dengan nama pada saat pemesanan.</li>
                </ol>
              </li>
              <li>
                Mitra Vendor berhak menolak masuk jika nama pada tiket tidak sesuai dengan kartu identitas atau jika tiket terindikasi palsu/sudah digunakan.
              </li>
            </ol>
          </section>

          {/* 4. Pembatalan & Refund */}
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. KEBIJAKAN PEMBATALAN DAN PENGEMBALIAN DANA (REFUND)</h2>
            <ol className="list-decimal pl-5 space-y-3 marker:font-bold">
              <li>
                Kecuali dinyatakan lain pada deskripsi Produk (&quot;Non-refundable&quot;), tiket yang sudah dibeli tidak dapat dibatalkan atau dikembalikan dananya.
              </li>
              <li>
                Dalam hal acara atau lokasi wisata ditutup secara mendadak oleh Mitra Vendor (Force Majeure), pengembalian dana akan diproses sesuai dengan kebijakan Mitra Vendor terkait.
              </li>
              <li>
                Proses refund dapat memakan waktu hingga 14 hari kerja tergantung pada metode pembayaran yang digunakan.
              </li>
            </ol>
          </section>

           {/* 5. Tanggung Jawab Pengguna */}
           <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. TANGGUNG JAWAB PENGGUNA</h2>
            <p className="mb-3">Saat menggunakan Situs TiketLoka, Anda dilarang untuk:</p>
            <ol className="list-decimal pl-5 space-y-3 marker:font-bold">
              <li>Menggunakan data palsu atau identitas orang lain untuk melakukan pemesanan.</li>
              <li>Melakukan pemesanan spekulatif atau palsu untuk tujuan penipuan.</li>
              <li>Menggunakan bot, scraper, atau alat otomatis lainnya untuk mengakses konten Situs tanpa izin tertulis dari kami.</li>
            </ol>
          </section>

        </div>

        {/* Footer Halaman */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col items-center">
          <p className="text-gray-500 mb-4 text-center">
            Dengan melanjutkan penggunaan layanan TiketLoka, Anda dianggap telah membaca dan menyetujui seluruh Syarat dan Ketentuan ini.
          </p>
          <div className="flex gap-6 text-sm font-medium text-blue-600">
             <Link href="/" className="hover:underline">Beranda</Link>
             <Link href="/privacy" className="hover:underline">Kebijakan Privasi</Link>
          </div>
          <p className="text-xs text-gray-400 mt-8">&copy; {new Date().getFullYear()} TiketLoka Indonesia. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}