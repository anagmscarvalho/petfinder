from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import event

sqlite_url= "sqlite:///petfinder.db"

engine = create_engine(
	sqlite_url,
	connect_args={"check_same_thread": False}, #Para utilizar várias threads, já que o sqlite só deixa a conecxão na thread que a criou

)

@event.listens_for(engine, "connect")
def ativar_foreign_keys(dbapi_connection, connection_record):
	cursor = dbapi_connection.cursor()
	cursor.execute("PRAGMA foreign_keys=ON")
	cursor.close

def criar_banco_e_tabelas():
	SQLModel.metadata.create_all(engine)

def get_session():
	with Session(engine) as session:
		yield session
