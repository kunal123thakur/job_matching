import pandas as pd
from sqlalchemy import create_engine, text
from dotenv import load_dotenv
import os
import re
from datetime import datetime
from sentence_transformers import SentenceTransformer

def parse_stipend(s):
    if pd.isna(s): 
        return (0, 0)
    s = str(s).lower()
    if "unpaid" in s:
        return (0, 0)
    
    nums = re.findall(r'\d[\d,]*', s)
    nums = [int(x.replace(',', '')) for x in nums]

    if len(nums) == 1:
        return (nums[0], nums[0])
    elif len(nums) >= 2:
        return (nums[0], nums[1])
    else:
        return (0, 0)

def load_data():
    load_dotenv()
    url = os.getenv('DATABASE_URL')
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql+psycopg2://", 1)

    engine = create_engine(url)

    data = pd.read_csv('SIH/internship.csv')
    df = data.head(200)

    df['internship_title'] = df['internship_title'].str.strip()
    df['company_name'] = df['company_name'].str.strip()
    df['location'] = df['location'].str.strip().str.title()
    df['is_remote'] = df['location'].str.contains("work from home", case=False)
    df['location'] = df['location'].replace("Work From Home", "Remote")
    df['duration_months'] = df['duration'].str.extract(r'(\d+)').astype(float)
    df[['stipend_min','stipend_max']] = df['stipend'].apply(lambda x: pd.Series(parse_stipend(x)))
    df['stipend_avg'] = (df['stipend_min'] + df['stipend_max']) / 2
    
    df['start_date'] = None # Set start_date to None as it is not available in the csv

    df = df[['internship_title','company_name','location','is_remote',
             'start_date','duration_months','stipend_min','stipend_max','stipend_avg']]

    create_table_query = """
    CREATE TABLE IF NOT EXISTS internships (
        id SERIAL PRIMARY KEY,
        internship_title TEXT,
        company_name TEXT,
        location TEXT,
        start_date DATE,
        duration_months INT,
        stipend_min INT,
        stipend_max INT,
        stipend_avg INT,
        is_remote BOOLEAN,
        skills TEXT[],
        embedding VECTOR(384)
    );
    """
    with engine.connect() as conn:
        conn.execute(text(create_table_query))
        conn.commit()
        print("✅ Table 'internships' created successfully!")

    df.to_sql("internships", engine, if_exists="append", index=False)
    print("✅ Data inserted successfully!")

    embedder = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    df['text_for_embedding'] = df['internship_title'] + " " + df['company_name']
    embeddings = embedder.encode(df['text_for_embedding'].tolist(), convert_to_numpy=True)

    with engine.begin() as conn:
        for i, row in df.iterrows():
            emb = embeddings[i].astype(float)
            emb_str = "[" + ",".join([str(x) for x in emb]) + "]"

            query = text('''
                UPDATE internships
                SET embedding = :embedding
                WHERE internship_title = :title AND company_name = :company
            ''')
            conn.execute(query, {
                "embedding": emb_str,
                "title": row['internship_title'],
                "company": row['company_name']
            })
    print("✅ Embeddings stored in DB!")

if __name__ == "__main__":
    load_data()
