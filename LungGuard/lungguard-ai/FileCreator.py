from random import choice
f = open("Temp.txt","a+")
msg = []
for _ in range(100000):
    ch = choice(['Ateeq','Rahil','Akash','Moki'])
    msg.append(f"Hello {ch}, bye\n")
f.writelines(msg)
f.close()
