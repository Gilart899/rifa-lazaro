RIFA ENTRE AMIGOS — NOVA INTERFACE VISUAL

FASE 1: APENAS APARÊNCIA.
- Não há Firebase.
- Não há gravação de dados.
- Não há pagamento real.
- A seleção de números é apenas uma simulação visual.

A interface foi construída mobile-first e depois adaptada para desktop.

Arquivos principais:
index.html
style.css
script.js
img/

A foto da mãe está representada por um marcador visual até que o arquivo correto seja definido.


## Fase 1.1 — correção da reserva

Esta versão corrige a reserva pública para usar `rifa/numeros`, autenticação anônima e reservas vinculadas ao participante.

### Antes de testar
1. No Firebase Console, abra **Authentication > Sign-in method**.
2. Ative **Anonymous / Anônimo**.
3. Em **Realtime Database > Rules**, publique o conteúdo de `database.rules.json` desta versão.
4. Publique os arquivos do ZIP no GitHub Pages.

A reserva cria um registro em `rifa/reservas/{reservaId}` e reserva cada número em `rifa/numeros/{000-999}` por 30 minutos.
