import hashlib
import time

text = "Test123"

# Startzeit messen
start_time = time.time()

# SHA1 Hash berechnen
hash_object = hashlib.sha1(text.encode('utf-8'))
hex_dig = hash_object.hexdigest()

# Endzeit messen
end_time = time.time()
duration = end_time - start_time

print(f"String: {text}")
print(f"SHA1 Hash: {hex_dig}")
print(f"Dauer: {duration:.6f} Sekunden")
