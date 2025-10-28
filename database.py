from sqlalchemy import create_engine, String, Integer, Column # type: ignore
from sqlalchemy.orm import sessionmaker, declarative_base # type: ignore
from sqlalchemy.inspection import inspect
from random import randint as rd

# BANCO SQLITE
db = create_engine ("sqlite:///database/geral_database.db")
Session = sessionmaker(bind=db)
session = Session()

# dados e tipo de dados do banco
Base = declarative_base()

# Tabela das classes da manha
class Classe_manha(Base):
    __tablename__='Classe_manha'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column("nome", String, unique=True)
    ponto = Column("ponto", Integer)
    icon = Column("icon", String)

    def __init__(self,nome,ponto,icon):
        self.nome = nome
        self.ponto = ponto
        self.icon = icon

    def __repr__(self):
        return f"Casa: {self.nome}, ponto: {self.ponto}"

# Tabela das classes da tarde
class Classe_tarde(Base):
    __tablename__='Classe_tarde'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column("nome", String, unique=True)
    ponto = Column("ponto", Integer)
    icon = Column("icon", String)

    def __init__(self,nome,ponto,icon):
        self.nome = nome
        self.ponto = ponto
        self.icon = icon

    def __repr__(self):
        return f"Casa: {self.nome}, ponto: {self.ponto}"
    
# Tabela das classes da noite
class Classe_noite(Base):
    __tablename__='Classe_noite'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column("nome", String, unique=True)
    ponto = Column("ponto", Integer)
    icon = Column("icon", String)

    def __init__(self,nome,ponto,icon):
        self.nome = nome
        self.ponto = ponto
        self.icon = icon

    def __repr__(self):
        return f"Casa: {self.nome}, ponto: {self.ponto}"


# Tabela para usuarios ADM
class Adm(Base):
    __tablename__ = 'Adm'
    id = Column(Integer, primary_key=True, autoincrement=True)
    nome = Column("nome", String)
    usuario = Column("usuario", String, unique=True)
    senha = Column("senha", String)

    def __init__(self,nome, usuario, senha):
        self.nome = nome
        self.usuario = usuario
        self.senha = senha

    def __repr__(self):
        return f" senha{self.senha} usuario{self.usuario}"

# Tabela para historico de adição de pontos
class History(Base):
    __tablename__ = 'History'
    id = Column(Integer, primary_key=True, autoincrement=True)
    event = Column("event", String)

    def __init__(self,event):
        self.event = event

    def __repr__(self):
        return f"{self.event}"

Base.metadata.create_all(bind=db)

# USUARIO ADMIN PADRÃO
if not session.query(Adm).filter_by(nome="Global Admin").first():
    print("Creating admin user")
    name, user, password = ("Global Admin",
                             f"EK{rd(0, 1231)}SOX{rd(0, 123)}M{rd(0, 123)}QTON{rd(0, 1213)}ZBQAT1NMn{rd(0, 123)}ai@#mn{rd(0, 1213)}!h!o#",
                             f"J{rd(0, 1213)}SO{rd(0, 123)}ADJO{rd(0, 1123)}WQkAPZ{rd(0, 123)}SZ{rd(0, 123)}kKQEWQk{rd(0, 1231)}QEJi{rd(0, 123)}Q{rd(0, 123)}JE11j{rd(0, 1223)}1j5")
    dados = [
        Adm(nome=name, usuario=user, senha=password),
    ]
    with open("globalAdminCredencials.txt", "w") as archive:
        archive.write(
            f"""PASSWORD: {password}\nUSER: {user}"""
            )

    session.add(dados[0])
    session.commit()
    