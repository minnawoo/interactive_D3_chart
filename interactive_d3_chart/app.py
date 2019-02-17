import os

from flask import Flask, render_template

import csv

app = Flask(__name__)


#################################################
# Database Setup
#################################################

@app.route("/")
def index():
    """Return the homepage."""
    return render_template("index.html")

if __name__ == "__main__":
    app.run()
