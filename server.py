from http.server import HTTPServer, SimpleHTTPRequestHandler
import webbrowser
import os
import sys
import socket

class CustomHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        print(f"Received request for: {self.path}")
        try:
            super().do_GET()
            print(f"Successfully served: {self.path}")
        except Exception as e:
            print(f"Error serving {self.path}: {e}")
            self.send_error(500, f"Error: {str(e)}")

    def log_message(self, format, *args):
        print(f"Server log: {format%args}")

def is_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def run(server_class=HTTPServer, handler_class=CustomHandler, port=8000):
    try:
        if is_port_in_use(port):
            print(f"Port {port} is already in use. Trying port {port + 1}")
            port += 1
            
        script_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(script_dir)
        print(f"Current directory: {os.getcwd()}")
        print(f"Files in directory: {os.listdir('.')}")
            
        server_address = ('', port)
        httpd = server_class(server_address, handler_class)
        print(f"Starting server at http://localhost:{port}")
        print(f"Press Ctrl+C to stop the server")
        webbrowser.open(f'http://localhost:{port}')
        httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
        input("Press Enter to exit...")
        sys.exit(1)

if __name__ == '__main__':
    try:
        run()
    except KeyboardInterrupt:
        print("\nServer stopped by user")
        sys.exit(0)
    except Exception as e:
        print(f"Unexpected error: {e}")
        input("Press Enter to exit...")
        sys.exit(1)
