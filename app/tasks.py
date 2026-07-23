import asyncio
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from app.core.database import engine
from app.models.chat import Conversa
from app.models.mensagem import Mensagem

async def limpar_chats_antigos():
    while True:
        try:
            with Session(engine) as session:
                limite = datetime.utcnow() - timedelta(days=30)
                
                # Buscar todas as conversas
                conversas = session.exec(select(Conversa)).all()
                deletadas = 0
                
                for c in conversas:
                    # Buscar ultima mensagem
                    stmt_msg = select(Mensagem).where(Mensagem.conversa_id == c.id).order_by(Mensagem.criado_em.desc()).limit(1)
                    ultima_msg = session.exec(stmt_msg).first()
                    
                    if ultima_msg:
                        # Se a ultima mensagem foi ha mais de 30 dias
                        if ultima_msg.criado_em < limite:
                            session.delete(c)
                            deletadas += 1
                    else:
                        # Se não tem mensagens, usar a data de criação do chat
                        if c.criado_em < limite:
                            session.delete(c)
                            deletadas += 1
                
                if deletadas > 0:
                    session.commit()
                    print(f"[TAREFA] {deletadas} conversas antigas foram apagadas.")
        except Exception as e:
            print(f"[ERRO TAREFA] Falha ao limpar conversas: {e}")
        
        # Executar a cada 24 horas (86400 segundos)
        await asyncio.sleep(86400)
