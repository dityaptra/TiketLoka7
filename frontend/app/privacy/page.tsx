import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function PrivacyPolicy() {
  // Gunakan tanggal statis untuk mencegah Hydration Mismatch
  const lastUpdated = "19 Desember 2025";
  const currentYear = "2025";

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Container Utama */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        
        {/* Header: Logo & Judul */}
        <div className="text-center mb-12">
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
          <h1 className="text-3xl font-bold text-gray-900">Kebijakan Privasi TiketLoka</h1>
          <p className="text-sm text-gray-500 mt-2">
            Terakhir diperbarui: {lastUpdated}
          </p>
        </div>

        {/* Konten Dokumen */}
        <div className="space-y-8 text-sm sm:text-base leading-relaxed text-justify">
          
          {/* Bagian Intro */}
          <section>
            <p>
              Anda harus dapat membuat keputusan yang tepat mengenai data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana <strong>TiketLoka</strong> (&quot;kami&quot;) mengumpulkan, menggunakan, membagikan, dan mengelola data pribadi milik individu (&quot;Anda&quot;) sehubungan dengan layanan pembelian tiket wisata online, reservasi event, dan layanan terkait lainnya melalui situs web dan aplikasi TiketLoka.
            </p>
            <p className="mt-4">
              Harap baca Kebijakan Privasi ini dengan saksama untuk memastikan Anda memahami praktik kami dalam mengelola data Anda.
            </p>
          </section>

          {/* Bagian 1: Tujuan */}
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-4">1. Ruang Lingkup Kebijakan Privasi</h2>
            <p>
              Kebijakan Privasi ini berlaku untuk semua pengguna TiketLoka, termasuk mereka yang melakukan pemesanan tiket wisata tanpa mendaftar (tamu), pengguna terdaftar, serta mitra penyedia wahana/event yang bekerja sama dengan kami.
            </p>
          </section>

          {/* Bagian 2: Data yang Diproses */}
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-4">2. Data Pribadi yang Kami Kumpulkan</h2>
            <p className="mb-4">
              Kami mengumpulkan data pribadi untuk memenuhi kewajiban kami dalam menyediakan tiket dan layanan wisata kepada Anda. Berikut adalah rincian kategori data yang kami proses:
            </p>

            {/* Container Tabel agar scrollable di HP */}
            <div className="overflow-x-auto border border-gray-300 rounded-sm">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-50 border-b border-gray-300">
                    <th className="p-4 font-bold text-gray-900 w-1/3 border-r border-gray-300">Kategori Data Pribadi</th>
                    <th className="p-4 font-bold text-gray-900">Jenis Data yang Dikumpulkan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {/* Baris 1: Identitas */}
                  <tr>
                    <td className="p-4 align-top font-semibold border-r border-gray-300">Data Identitas</td>
                    <td className="p-4 align-top">
                      Nama lengkap (sesuai KTP/Paspor), alamat email, nomor telepon, tanggal lahir, dan kewarganegaraan. Untuk beberapa wahana wisata tertentu, kami mungkin meminta nomor identitas (NIK) untuk keperluan asuransi pengunjung.
                    </td>
                  </tr>
                  
                  {/* Baris 2: Transaksi */}
                  <tr>
                    <td className="p-4 align-top font-semibold border-r border-gray-300">Data Transaksi & Pemesanan</td>
                    <td className="p-4 align-top">
                      Detail pesanan tiket wisata Anda (nama destinasi, tanggal kunjungan, jumlah tiket), ID pemesanan (Booking ID), dan riwayat klaim pengembalian dana (refund) jika ada pembatalan.
                    </td>
                  </tr>

                  {/* Baris 3: Pembayaran */}
                  <tr>
                    <td className="p-4 align-top font-semibold border-r border-gray-300">Informasi Pembayaran</td>
                    <td className="p-4 align-top">
                      Detail metode pembayaran yang dipilih (Transfer Bank, E-Wallet, Kartu Kredit). 
                      <span className="italic text-gray-500"> Catatan: Kami tidak menyimpan nomor CVV kartu kredit Anda.</span>
                    </td>
                  </tr>

                  {/* Baris 4: Konten Pengguna */}
                  <tr>
                    <td className="p-4 align-top font-semibold border-r border-gray-300">Konten Pengguna</td>
                    <td className="p-4 align-top">
                      Ulasan (review) yang Anda berikan terhadap destinasi wisata, foto yang Anda unggah saat memberikan rating, dan pertanyaan yang Anda ajukan kepada layanan pelanggan kami.
                    </td>
                  </tr>

                  {/* Baris 5: Data Teknis */}
                  <tr>
                    <td className="p-4 align-top font-semibold border-r border-gray-300">Data Teknis & Perangkat</td>
                    <td className="p-4 align-top">
                      Alamat IP, jenis perangkat, sistem operasi, dan data cookies untuk meningkatkan pengalaman pengguna dan keamanan aplikasi.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Bagian 3: Penggunaan Data */}
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-4">3. Bagaimana Kami Menggunakan Data Anda</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Memproses dan menerbitkan E-Ticket yang valid untuk masuk ke lokasi wisata.</li>
              <li>Memverifikasi identitas Anda saat penukaran tiket di loket destinasi (jika diperlukan).</li>
              <li>Mengirimkan notifikasi penting terkait perubahan jam operasional tempat wisata atau pembatalan event.</li>
              <li>Mendeteksi dan mencegah penipuan atau penggunaan akun secara ilegal.</li>
            </ul>
          </section>

          {/* Bagian 4: Berbagi Data */}
          <section>
            <h2 className="text-xl font-bold text-blue-600 mb-4">4. Pembagian Data dengan Pihak Ketiga</h2>
            <p>
              Kami dapat membagikan data Anda kepada <strong>Mitra Vendor Wisata</strong> (pengelola tempat wisata atau promotor event) semata-mata untuk tujuan validasi tiket Anda di pintu masuk. Kami menjamin bahwa data yang dibagikan hanya sebatas yang diperlukan untuk operasional.
            </p>
          </section>

          {/* Bagian 5: Kontak */}
          <section className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Hubungi Petugas Privasi Kami</h2>
            <p className="mb-4">
              Jika Anda memiliki pertanyaan mengenai penggunaan data pribadi Anda di TiketLoka, silakan hubungi kami:
            </p>
            <ul className="text-blue-600 font-medium">
              <li>Email: <a href="mailto:privacy@tiketloka.com" className="hover:underline">privacy@tiketloka.com</a></li>
              <li>Telepon: +62 21 1234 5678</li>
            </ul>
          </section>

        </div>

        {/* Footer Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {currentYear} TiketLoka. Hak Cipta Dilindungi.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Link href="/" className="hover:text-blue-600">Beranda</Link>
            <Link href="/terms" className="hover:text-blue-600">Syarat & Ketentuan</Link>
          </div>
        </div>

      </div>
    </div>
  );
}