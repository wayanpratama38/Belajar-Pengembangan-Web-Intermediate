export default class HomePage{
    async render(){
        return `
        <h1 class="content-title">Home Page</h1>
        <p>Ini adalah konten halaman utama.</p>
        <p>Mari kita cek <a href="#/about">halaman about</a>!</p>
      `;
    }
}