import requests


# Get the topic entered by the user from the input field
user_topic = input("Enter the song idea: ")

# Define the data payload with the user-entered topic
data = {'topic': user_topic}



url = 'http://127.0.0.1:5000/generate_lyrics'
data = {'topic': 'write a song about love and heartbreak'}
response = requests.post(url, json=data)

if response.status_code == 200:
    print(response.json())
else:
    print('Error:', response.text)
