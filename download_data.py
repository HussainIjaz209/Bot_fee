"""
MongoDB Atlas Data Downloader Script
Downloads `vps_records` and `bot_records` from the `vps_fee_management` database.
"""

import json
from pymongo import MongoClient
from bson import json_util

# Correct Atlas connection string with your database user credentials:
MONGODB_URI = "mongodb+srv://hussainijaz233911_db_user:IYEHjSzISqRPUSeL@cluster0.hqdtaki.mongodb.net/?retryWrites=true&w=majority"

def download_data():
    print("Connecting to MongoDB Atlas...")
    client = MongoClient(MONGODB_URI)
    db = client["vps_fee_management"]

    # 1. Download vps_records
    print("Downloading 'vps_records'...")
    vps_cursor = db["vps_records"].find({})
    vps_docs = list(vps_cursor)
    with open("vps_records.json", "w", encoding="utf-8") as f:
        f.write(json_util.dumps(vps_docs, indent=2))
    print(f" Saved {len(vps_docs)} records to 'vps_records.json'")

    # 2. Download bot_records
    print("Downloading 'bot_records'...")
    bot_cursor = db["bot_records"].find({})
    bot_docs = list(bot_cursor)
    with open("bot_records.json", "w", encoding="utf-8") as f:
        f.write(json_util.dumps(bot_docs, indent=2))
    print(f" Saved {len(bot_docs)} records to 'bot_records.json'")

    print("\nDownload complete! Both files are saved in your project directory.")

if __name__ == "__main__":
    download_data()
