-- LE FLOU DE MOUVEMENT, RECONNU (25 novembre 2026). `flou_lu` : la photo a été
-- regardée. `flou_mouvement` : l'image a l'allure d'un filé. Ce n'est PAS une
-- étiquette : c'est ce que la pile « À trier » propose, et que Noé accepte.
alter table photos add column if not exists flou_lu boolean not null default false;
alter table photos add column if not exists flou_mouvement boolean not null default false;
