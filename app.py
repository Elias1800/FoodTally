from flask import Flask, render_template

app = Flask(__name__)

@app.route('/')
def login():
    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

@app.route('/app')
def feira():
    return render_template('app.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')