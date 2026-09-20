import os
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv
load_dotenv()
from langchain_community.vectorstores import FAISS

def setup_rag():
    print("Setting up RAG embeddings...")
    docs_dir = r"C:\Users\sanja\Desktop\Travel_Web\Documents"
    
    if not os.path.exists(docs_dir):
        print(f"Error: {docs_dir} does not exist.")
        return

    pdf_files = [f for f in os.listdir(docs_dir) if f.endswith('.pdf')]
    
    all_documents = []
    
    for pdf in pdf_files:
        print(f"Loading {pdf}...")
        loader = PyPDFLoader(os.path.join(docs_dir, pdf))
        docs = loader.load()
        # Add metadata source
        for doc in docs:
            doc.metadata["source"] = pdf
        all_documents.extend(docs)
        
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    splits = text_splitter.split_documents(all_documents)
    
    print(f"Created {len(splits)} chunks.")
    
    # Use Gemini Embeddings to save RAM
    embeddings = GoogleGenerativeAIEmbeddings(model="models/gemini-embedding-2")
    
    print("Building FAISS index...")
    vectorstore = FAISS.from_documents(splits, embeddings)
    
    # Save locally
    db_path = r"C:\Users\sanja\Desktop\Travel_Web\travel_agency_backend\faiss_index"
    vectorstore.save_local(db_path)
    print(f"Saved FAISS index to {db_path}")

if __name__ == "__main__":
    setup_rag()
