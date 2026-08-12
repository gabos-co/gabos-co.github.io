#!/usr/bin/env python3
"""Fejlesztoi kiszolgalo a gabos.co-hoz.

Ket dolgot tud tobbet a beepitett http.server-nel:
  1. Semmit nem engedjuk gyorsitotarba (Cache-Control: no-store), tehat a
     bongeszo mindig a lemezen levo allapotot latja.
  2. Az index.html vegere befuz egy pici figyelot, ami masodpercenkent
     megkerdezi a /__version vegpontot, es ha a fajlok valtoztak, magatol
     ujratolti a lapot. Igy nem kell kezzel frissiteni.

A befuzes csak a kiszolgalas pillanataban tortenik, a lemezen levo
index.html erintetlen marad -- eles kiadasba nem szivarog dev-kod.
"""
import http.server
import os
import socketserver
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8088

WATCH_SUFFIXES = ('.html', '.css', '.js', '.mjs', '.svg', '.jpg', '.png', '.woff2')

RELOAD_SNIPPET = """
<script>
/* fejlesztoi automatikus ujratoltes -- csak a dev-kiszolgalo fuzi be */
(function () {
  var last = null;
  setInterval(function () {
    fetch('/__version', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (v) {
        if (last === null) { last = v; return; }
        if (v !== last) location.reload();
      })
      .catch(function () {});
  }, 1000);
})();
</script>
"""


def version_stamp():
    newest = 0.0
    for base, dirs, files in os.walk(ROOT):
        dirs[:] = [d for d in dirs if not d.startswith('.') and d != 'vendor']
        for name in files:
            if name.endswith(WATCH_SUFFIXES):
                try:
                    newest = max(newest, os.path.getmtime(os.path.join(base, name)))
                except OSError:
                    pass
    return '%.3f' % newest


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        if self.path.split('?')[0] == '/__version':
            body = version_stamp().encode()
            self.send_response(200)
            self.send_header('Content-Type', 'text/plain; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        path = self.path.split('?')[0]
        if path in ('/', '/index.html'):
            try:
                with open(os.path.join(ROOT, 'index.html'), 'rb') as fh:
                    html = fh.read().decode('utf-8')
            except OSError:
                return super().do_GET()
            html = html.replace('</body>', RELOAD_SNIPPET + '</body>', 1)
            body = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        return super().do_GET()

    def log_message(self, *a):
        pass


class Server(socketserver.ThreadingTCPServer):
    allow_reuse_address = True
    daemon_threads = True


if __name__ == '__main__':
    with Server(('127.0.0.1', PORT), Handler) as httpd:
        print('dev-kiszolgalo: http://127.0.0.1:%d (no-store + auto-reload)' % PORT)
        httpd.serve_forever()
