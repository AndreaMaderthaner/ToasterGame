import serial 
from pynput.keyboard import Key, Controller
# ser = serial.Serial('COM5', 9600, timeout=1)
# print(ser.name) # check which port was really used
# ser2 = serial.Serial('COM6', 9600, timeout=1)
# ser.write(b'helzajfhnaiuozenfouiazeflo') # write a string
# print(ser2.name);
# test = ser2.read(10)
# print(test)
# ser.close() # close port
# ser2.close()
import serial
import time
## Can only be used if we're not using the port through the arduino IDE
# arduino = serial.Serial(port='COM5', baudrate=115200, timeout=.1)
reader = serial.Serial('COM6', 9600, timeout=.1)
keyboard = Controller()
# def write_read(x):
#     arduino.write(bytes(x, 'utf-8'))
#     time.sleep(0.05)
#     data = reader.readline()
#     return data

def read():
    data = reader.readline()
    return data
while True:
    # num = input("Enter a number: ") # Taking input from user
    # value = write_read(num)
    value = read()
    if(value != b''):
        keyboard.press('a')
        keyboard.release('a')
