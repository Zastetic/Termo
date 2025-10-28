from database import *
from flask import render_template, request, redirect, Blueprint, jsonify, url_for
from flask import session as user_session
import time

bp = Blueprint("main", __name__)

USER = "admin"
PASSWORD = "1234"


# API's -------------------------
@bp.route("/set-periodo", methods=["POST"])
def set_periodo():
    """
    Seta o periodo atual que o client irá ver.
    altera user_session["periodo"].
    Possiveis valores: 'manha', 'tarde', 'noite'.
    """

    data = request.get_json()
    user_session['periodo'] = data.get('periodo')

    return jsonify(status='ok', periodo=user_session['periodo'])


@bp.route("/classes-name")
def get_names():
    """
    Pega o nome de todas as salas dado o periodo de user_session["periodo"]
    """

    if "periodo" not in user_session:
        user_session['periodo'] = 'manha'

    return jsonify({"names": [c.nome for c in session.query(globals()["Classe_"+user_session["periodo"]]).all()]})

@bp.route("/get-history")
def get_history():
    """
    Atualiza o historico da pagina de painel de admin.
    Cada pagina do historico leva 5 eventos. Numeração da pagina vem de user_session["history_page"].
    Dados do database veêm ordenados ao contrario com o objetivo de mostrar sempre o mais recente na frente.
    """

    if "autenticado" not in user_session:
        return "sai daqui seu bobo"

    PAGE = user_session["history_page"]
    MAX_PER_ROW = 5

    EVENTS = [c.event for c in session.query(History).order_by(History.id.desc()).offset(PAGE * MAX_PER_ROW).limit(MAX_PER_ROW).all()]
    if len(EVENTS) == 0:
        EVENTS.append("Fim dos eventos")

    return jsonify({"events": EVENTS})

@bp.route("/classes-points")
def get_points():
    """
    Pega os pontos de todas as salas dado o periodo de user_session["periodo"]
    """

    if 'periodo' not in user_session:
        user_session['periodo'] = 'manha'

    return jsonify({"points": [c.ponto for c in session.query(globals()["Classe_"+user_session["periodo"]]).all()]})

@bp.route("/classes-icons")
def get_icons():
    """
    Pega o brasão de todas as salas dado o periodo de user_session["periodo"]
    """

    if 'periodo' not in user_session:
        user_session['periodo'] = 'manha'

    return jsonify({"icons": [c.icon for c in session.query(globals()["Classe_"+user_session["periodo"]]).all()]})

@bp.route("/get-admin-keys")
def get_admin_keys():
    """
    Retorna todas as chaves de admin em uma array com "nome", "usuario" e "senha".
    """

    if "autenticado" not in user_session:
        return "vai ti fudê rapa"

    return jsonify({"nome": [x.nome for x in session.query(Adm).all()],
                    "usuario": [y.usuario for y in session.query(Adm).all()],
                    "senha": [z.senha for z in session.query(Adm).all()]})

@bp.route("/modify-admin-keys")
def mod_admin_keys():
    """
    API de modificação de chave de admin.
    Faz diferentes modificações no banco de dados caso new_user==null ou new_password==null.
    Se new_user for vazio, será igual ao usuario atual. E fara o update no banco de dados. Mesma coisa para senha.
    Url pattern --> /modify-admin-keys?name=str&new_user=str&new_password=str
    """

    if "autenticado" not in user_session:
        return "vai ti fudê rapa"
    
    name = request.args.get("name")
    new_user = request.args.get("new_user")
    new_password = request.args.get("new_pass")

    # Verifica se todos não estão vazios e não sao Nonetype
    if type(new_user) == str and type(new_password) == str and type(name) == str:
        if len(new_user) <= 0:
            new_user = session.query(Adm).filter_by(nome=name).first().usuario
        if len(new_password) <= 0:
            new_password = session.query(Adm).filter_by(nome=name).first().senha

        casa_requery = session.query(Adm).filter_by(nome=name).update({"usuario" : new_user, "senha": new_password})
        session.commit()
        return redirect(url_for("main.admin"))
    else:
        return f"{(name), (new_user), (new_password)}"

""" --> ROTAS INICIAIS <-- """

@bp.route("/")
@bp.route("/home")
def index():
    return render_template('main_page.html')

@bp.route('/rules')
def rules():
    return render_template("rules.html")

@bp.route('/pre-ranking')
def pre_ranking():
    return render_template("preranking.html")

@bp.route("/ranking")
def ranking():
    return render_template("ranking.html")

@bp.route('/pontuation')
def pontuation():
    return render_template("pontuation.html")

@bp.route('/turn_select')
def turn_select():
    return render_template("preranking.html")

@bp.route("/help")
def help():
    return render_template("help.html")

""" --> PAGINAS DE ADM <-- """

@bp.route('/adm-login-page', methods=["POST", "GET"])
def adm_login_page():
    """
    Rota de login para adm.
    Se credenciais forem validas, user_session['autenticado'] deixa de ser None e vira True,
    se não, não há modificação.
    user_session["adm_name"] se torna o nome relativo as credenciais. Não existe caso user_session['autenticado'] = None.
    """

    if  user_session.get('autenticado'):
        return redirect("/admin")

    # Autenticação
    if request.method == "POST":
        senha  = request.form["password"]
        usuario = request.form["username"]
        if not session.query(Adm).filter(Adm.usuario == usuario).first() == None:
            if session.query(Adm).filter(Adm.usuario == usuario).first().senha == senha:
                user_session['autenticado'] = True
                user_session["adm_name"] = session.query(Adm).filter(Adm.usuario == usuario).first().nome
                return redirect(url_for("main.admin"))
            else:
                return render_template('adm-login-page.html', error_message="Senha incorreta.")
        else:
            return render_template('adm-login-page.html', error_message="Usuario não existe")
        
    return render_template('adm-login-page.html')
    
@bp.route('/admin', methods=['POST', 'GET'])
def admin():
    """
    Rota do painel de adm.
    Funções disponiveis: Adicionar/remover pontos, editar/excluir/adicionar chave de admin, 
    adicionar/remover nova casa, sair da conta (user_session["autenticado"] = None; user_session["adm_name"] = None).
    requisitos atuais de jinja2: usuario, periodo, create_casa_error atual_page.
    """

    if not user_session.get('autenticado'):
        return redirect("/adm-login-page")
    
    if "periodo" not in user_session:
        user_session['periodo'] = 'manha'

    if "history_page" not in user_session:
        user_session['history_page'] = 0

    # Seleciona a classe a ser mostrada no painel apartir de user_session["periodo"]
    CASA = globals()["Classe_"+user_session["periodo"]]
    CREATE_CASA_ERROR = ""

    # Verifica requisição POST de formulario
    if request.method == "POST":
        form_id = request.form.get("form_id")

        # CAMPO DE ADIÇÃO DE NOVAS CHAVES DE LOGIN
        if form_id == "add_credencial":
            nome = request.form.get("nome")
            usuario = request.form.get("usuario")
            senha = request.form.get("senha")

            data = Adm(nome=nome, usuario=usuario, senha=senha)
            session.add(data)
            session.commit()

            print(f"Novo usuario enviado. Reconhecido como: {session.query(Adm).filter(Adm.usuario == usuario).first().nome}")

        # ADICIONA PONTO OU REMOVE PARA CADA CASA
        if form_id ==  "add_points":
            if request.form.get("casa"):
                nome_casa = request.form["casa"]
                pontos = int(request.form["pontos"])
                motivo = request.form.get("motivo")

                req = request.form.get("acao")
                if req == "adicionar" or req == "remover":
                    return redirect(url_for("main.mod_points", casa=nome_casa, pontos=pontos * -1 if req == "remover" else pontos * 1, motivo=motivo))
        
        # SE A REQUISIÇÃO FOR PARA LOGOUT
        if form_id == "logout":
            user_session.pop('autenticado')
            user_session.pop('adm_name')
            return redirect(url_for("main.adm_login_page"))
        
        # SE A AÇÃO DA REQUISIÇÃO POST FOR PARA EDITAR CASAS
        if form_id == "modify_casa":
            action = request.form.get("acao")
            casa_name = request.form.get("nome")

            # SE REQUISIÇÃO FOR PARA CRIAR CLASSE
            if action == "create_class":
                icon = request.files["foto"]

                # VERIFICAÇÃO DE ERROS
                error_verifications = {
                    len(casa_name) <= 0: "A casa precisa ter um nome.",
                    len(casa_name) > 40: "Nome maior que 40 caracteres.",
                    session.query(CASA).filter(CASA.nome == casa_name).first() != None: "Essa casa já existe"
                }
                
                for v, k in enumerate(error_verifications):
                    if k:
                        CREATE_CASA_ERROR = error_verifications[k]
                        return render_template('admin-control-panel.html', usuario=user_session["adm_name"], create_casa_error=CREATE_CASA_ERROR)
                    
                if not icon:
                    path = "static/images/paternimage.png"
                else:
                    path = f"static/images/{icon.filename}"
                    icon.save(path)

                db_data = CASA(nome=casa_name, ponto=0, icon=path)
                session.add(db_data)
                session.commit()

                print(f"Nova casa registrada. Reconhecida como: {session.query(CASA).filter(CASA.nome == casa_name).first().nome}")
        
            # SE REQUISIÇÃO FOR PARA DELETAR CLASSES
            if action == "delete_class":
                
                error_verifications = {
                    len(casa_name) <= 0: "A casa precisa ter um nome.",
                    len(casa_name) > 40: "Nome maior que 40 caracteres.",
                    session.query(CASA).filter(CASA.nome == casa_name).first() == None: "Essa casa não existe"
                }
                
                for v, k in enumerate(error_verifications):
                    if k:
                        CREATE_CASA_ERROR = error_verifications[k]
                        return render_template('admin-control-panel.html', usuario=user_session["adm_name"], create_casa_error=CREATE_CASA_ERROR)
                    
                casa_to_delete = session.query(CASA).filter(CASA.nome == casa_name).first()
                session.delete(casa_to_delete)
                session.commit()

        # SE REQUISIÇÃO FOR PARA DELETAR CHAVE ADM
        if form_id == "delete-credencial":
            admin_name = request.form.get("user_name")
            item = session.query(Adm).filter_by(nome=admin_name).first()
            print(item)

            if item:
                if session.query(Adm).count() <= 1:
                    return "Não foi possivel deletar. Há apenas um adm"
                session.delete(item)
                session.commit()
        
        # SE REQUISIÇÃO FOR PARA MUDAR PAGINA DE HISTORICO
        if form_id == "history":
            value = int(request.form.get("action_button"))

            soma = user_session["history_page"] + value
            if soma >= 0:
                user_session["history_page"] = soma

        return redirect(url_for('main.admin'))
    return render_template('admin-control-panel.html', usuario=user_session["adm_name"], 
                            periodo=user_session["periodo"], create_casa_error=CREATE_CASA_ERROR, 
                            atual_page="Página "+str(user_session["history_page"]+1))


@bp.route("/modify_points", methods=["GET"])
def mod_points():
    """
    Função responsavel pela adição de pontos
    Automaticamente cria eventos de historico e posta no database.
    Url patern --> /modify_points?casa=str&pontos=int&motivo=str
    
    """

    nome_casa = request.args.get("casa")
    pontos = request.args.get("pontos")
    motivo = request.args.get("motivo")

    #Adição da ação de modificação de pontos ao historico
    local_time = time.localtime()
    periodo = ""
    action = "perdeu" if int(pontos) < 0 else "ganhou"
    pontos_h = int(pontos) * -1 if int(pontos) < 0 else int(pontos) * 1

    if user_session["periodo"] == "manha":
        periodo = "matutino"
    elif user_session["periodo"] == "tarde":
        periodo = "vespertino"
    elif user_session["periodo"] == "noite":
        periodo = "noturno"

    message = f"[{local_time.tm_mday}/{local_time.tm_mon}/{local_time.tm_year}/{local_time.tm_hour}:{local_time.tm_min}] --> Periodo {periodo}, classe {nome_casa} {action} {pontos_h} pontos por: {motivo}"
    data = History(event=message)
    session.add(data)
    session.commit()


    CASA = globals()["Classe_"+user_session["periodo"]]
    SQL_points = session.query(CASA.ponto).filter(CASA.nome == nome_casa).scalar()

    add_points = SQL_points + int(pontos)
    casa_requery = session.query(CASA).filter_by(nome=nome_casa).update({"ponto" : add_points })
    session.commit()

    return redirect(url_for("main.admin"))

@bp.route('/logout')
def logout():
    session.clear()
    return redirect(url_for("adm-login-page"))

"""
By Victor.
"""