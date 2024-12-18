import asyncio
import websockets
import socket

async def handle_client(websocket):
    print("Client connected to WebSocket")
    buffer = ""
    while True:
        try:
            content = await asyncio.to_thread(tcp_connection.recv, 128)
            content = content.decode("utf-8")
            buffer += content

            while "\n" in buffer:
                message, buffer = buffer.split("\n", 1)
                message = message.strip()
                if message:
                    await websocket.send(message)
                    print(f"Sent data to WebSocket client: {message}")

        except Exception as e:
            print(f"Error: {e}")
            break
    print("Client disconnected")

# Setup TCP Server
tcp_client = socket.socket()
tcp_client.bind(('0.0.0.0', 12346))
tcp_client.listen(1)
print("TCP server waiting for ESP32 connection...")
tcp_connection, addr = tcp_client.accept()
print(f"ESP32 connected from {addr}")

# Setup WebSocket Server
async def main():
    start_server = await websockets.serve(handle_client, "localhost", 8765)
    async with start_server:
        await start_server.wait_closed()

# Run both servers
asyncio.run(main())

