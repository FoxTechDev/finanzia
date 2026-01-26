import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveComentariosRiesgo1769700000000 implements MigrationInterface {
    name = 'RemoveComentariosRiesgo1769700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Verificar si la columna existe antes de intentar eliminarla
        const columnExists = await queryRunner.query(`
            SELECT COUNT(*) as count
            FROM information_schema.COLUMNS
            WHERE TABLE_SCHEMA = DATABASE()
            AND TABLE_NAME = 'solicitud'
            AND COLUMN_NAME = 'comentariosRiesgo'
        `);

        if (columnExists[0].count > 0) {
            await queryRunner.query(`
                ALTER TABLE solicitud DROP COLUMN comentariosRiesgo
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Restaurar la columna en caso de rollback
        await queryRunner.query(`
            ALTER TABLE solicitud ADD COLUMN comentariosRiesgo TEXT NULL
        `);
    }
}
