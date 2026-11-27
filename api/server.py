"""Local registration API. Standard library only. Stores no supplied emails on disk."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json, re, uuid
from urllib.parse import urlparse
PROGRAMS = {"Digital Foundations", "Career Skills Lab", "Project Portfolio"}
class Handler(BaseHTTPRequestHandler):
    def reply(self, status, data):
        body = json.dumps(data).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin','http://localhost:5173')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.send_header('Access-Control-Allow-Methods','POST, GET, OPTIONS')
        self.end_headers(); self.wfile.write(body)
    def do_OPTIONS(self): self.reply(204,{})
    def do_GET(self):
        if urlparse(self.path).path == '/health': self.reply(200, {'status':'ok','service':'registration'})
        else: self.reply(404,{'error':'not_found'})
    def do_POST(self):
        if urlparse(self.path).path != '/api/register': return self.reply(404,{'error':'not_found'})
        try:
            length=int(self.headers.get('Content-Length','0'))
            if length <= 0 or length > 4096: return self.reply(413,{'error':'invalid_request_size'})
            obj=json.loads(self.rfile.read(length))
            if not isinstance(obj,dict): return self.reply(422,{'error':'invalid_fields'})
        except (ValueError,UnicodeDecodeError,json.JSONDecodeError): return self.reply(400,{'error':'malformed_json'})
        name=obj.get('full_name'); email=obj.get('email'); program=obj.get('program')
        valid=(isinstance(name,str) and 2 <= len(name.strip()) <= 80 and isinstance(email,str)
          and bool(re.fullmatch(r'[^\s@]+@[^\s@]+\.[^\s@]+',email))
          and program in PROGRAMS and obj.get('consent') is True)
        if not valid: return self.reply(422,{'error':'invalid_fields','message':'Check name, email, program and consent'})
        self.reply(201,{'status':'received','request_id':'REQ-'+uuid.uuid4().hex[:12].upper()})
if __name__ == '__main__':
    print('Registration API: http://localhost:8765')
    ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
