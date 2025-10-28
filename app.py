from flask import Flask
from routes import bp

app = Flask(__name__)
app.secret_key = "WEBPOINTSSECRETKEY0213215490313213265"
app.register_blueprint(bp)

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=5000, debug=True)
    