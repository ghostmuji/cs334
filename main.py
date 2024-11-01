import socket
import asyncio
import websockets
import http.server
import socketserver
import webbrowser
import os

# UDP setup for receiving data from ESP32
udp_ip_address = "0.0.0.0"
udp_port = 12346

# WebSocket setup
ws_clients = set()

"""Send message to all connected WebSocket clients."""
async def send_to_websockets(message):
    if ws_clients:
        await asyncio.wait([client.send(message) for client in ws_clients])

"""Handle new WebSocket connections."""
async def websocket_handler(websocket, port):
    print("New WebSocket connection")
    ws_clients.add(websocket)
    try:
        async for message in websocket:
            pass  # No need to handle incoming messages from the client
    except websockets.exceptions.ConnectionClosed:
        pass
    finally:
        ws_clients.remove(websocket)

"""Receive data from ESP32 via UDP and send to WebSocket clients as a string."""
async def udp_listener(): 
    udp_socket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    udp_socket.bind((udp_ip_address, udp_port))
    udp_socket.settimeout(0.1)  # Setting a timeout

    print(f"Listening for incoming messages on port {udp_port}...")

    while True:
        try:
            data, address = udp_socket.recvfrom(1024)
            light_value = int(data.decode('utf-8'))
            # print(f"Received message: {light_value} from {address}")

            await send_to_websockets(str(light_value))
        except socket.timeout:
            pass  # No data received, continue the loop

"""Serve index.html and other static files."""
def serve_http():
    PORT = 8001
    os.chdir('/home/student334/cs334/m3')  # Set the path to where index.html is located
    Handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        # Open the webpage before serving
        webbrowser.open(f'http://localhost:{PORT}/index.html')
        httpd.serve_forever()

async def main():
    # Start WebSocket server
    print("Starting WebSocket server...")
    ws_server = websockets.serve(websocket_handler, "0.0.0.0", 8080)
    print("WebSocket server started.")

    # Run WebSocket server and UDP receiver concurrently
    await asyncio.gather(
        ws_server,
        udp_listener(),
    )

if __name__ == "__main__":
    try:
        # Start HTTP server in a separate thread to avoid blocking asyncio loop
        from threading import Thread
        http_thread = Thread(target=serve_http)
        http_thread.daemon = True
        http_thread.start()

        # Run the WebSocket and UDP listener
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\nExiting...")
