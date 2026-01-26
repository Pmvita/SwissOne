// Minimal self-contained 404 page
// No imports, no components, just basic HTML structure
export default function NotFound() {
  return (
    <html>
      <head>
        <title>404</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body>
        <div style={{display:'flex',minHeight:'100vh',alignItems:'center',justifyContent:'center',fontFamily:'system-ui'}}>
          <div style={{textAlign:'center'}}>
            <h1 style={{fontSize:'2rem',margin:0}}>404</h1>
            <p style={{margin:'1rem 0'}}>Page not found</p>
            <a href="/landing" style={{color:'#1e40af',textDecoration:'underline'}}>Go home</a>
          </div>
        </div>
      </body>
    </html>
  );
}

