<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>ICE CUBO</title>
</head>
<body style="background:#000; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
  <h1>🧊 ICE CUBO ONLINE</h1>
  <p>Status: <span style="color:#0f0">Connected</span></p>
  <p>Modo: MVP Protótipo</p>

  <button onclick="checkAPI()">Test API</button>

  <script>
    async function checkAPI() {
      const res = await fetch("/api");
      const data = await res.json();
      alert(JSON.stringify(data));
    }
  </script>
</body>
</html>
