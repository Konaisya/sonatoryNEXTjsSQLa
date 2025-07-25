"""empty message

Revision ID: df5b4cf8f55a
Revises: 
Create Date: 2025-06-10 00:07:31.743359

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'df5b4cf8f55a'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('diagnosis',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=100), nullable=False),
    sa.Column('icd_code', sa.String(length=10), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('symptoms', sa.Text(), nullable=False),
    sa.Column('contraindications', sa.Text(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('procedures',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('contraindications', sa.Text(), nullable=False),
    sa.Column('frequency', sa.String(length=50), nullable=False),
    sa.Column('duration_min', sa.Integer(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('rooms',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('number', sa.String(length=10), nullable=False),
    sa.Column('floor', sa.Integer(), nullable=False),
    sa.Column('capacity', sa.Integer(), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('role', sa.String(length=255), nullable=False),
    sa.Column('email', sa.String(length=255), nullable=False),
    sa.Column('password', sa.String(length=255), nullable=False),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('parents',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('id_user', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('phone', sa.String(length=20), nullable=False),
    sa.Column('address', sa.String(length=255), nullable=False),
    sa.Column('passport_data', sa.String(length=100), nullable=False),
    sa.ForeignKeyConstraint(['id_user'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('staff',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('id_user', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('position', sa.String(length=255), nullable=False),
    sa.Column('qualification', sa.String(length=255), nullable=False),
    sa.Column('hire_date', sa.DATE(), nullable=False),
    sa.Column('department', sa.String(length=100), nullable=False),
    sa.Column('schedule', sa.String(length=255), nullable=False),
    sa.ForeignKeyConstraint(['id_user'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('treatment_courses',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('description', sa.Text(), nullable=False),
    sa.Column('price', sa.DECIMAL(precision=7, scale=2), nullable=False),
    sa.Column('duration_days', sa.Integer(), nullable=False),
    sa.Column('id_diagnosis', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['id_diagnosis'], ['diagnosis.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('childs',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('name', sa.String(length=255), nullable=False),
    sa.Column('birth_date', sa.Date(), nullable=False),
    sa.Column('gender', sa.String(length=1), nullable=False),
    sa.Column('id_parent', sa.Integer(), nullable=False),
    sa.Column('height', sa.DECIMAL(precision=4, scale=1), nullable=False),
    sa.Column('weight', sa.DECIMAL(precision=4, scale=1), nullable=False),
    sa.Column('blood', sa.String(length=5), nullable=False),
    sa.Column('disability', sa.String(length=255), nullable=False),
    sa.Column('vaccinations', sa.Text(), nullable=False),
    sa.Column('medical_note', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['id_parent'], ['parents.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('courses_procedures',
    sa.Column('id_course', sa.Integer(), nullable=False),
    sa.Column('id_procedure', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['id_course'], ['treatment_courses.id'], ),
    sa.ForeignKeyConstraint(['id_procedure'], ['procedures.id'], ),
    sa.PrimaryKeyConstraint('id_course', 'id_procedure')
    )
    op.create_table('child_diagnosis',
    sa.Column('id_child', sa.Integer(), nullable=False),
    sa.Column('id_diagnosis', sa.Integer(), nullable=False),
    sa.Column('date_diagnosis', sa.Date(), nullable=False),
    sa.Column('doctor', sa.String(length=255), nullable=False),
    sa.Column('notes', sa.Text(), nullable=False),
    sa.ForeignKeyConstraint(['id_child'], ['childs.id'], ),
    sa.ForeignKeyConstraint(['id_diagnosis'], ['diagnosis.id'], ),
    sa.PrimaryKeyConstraint('id_child', 'id_diagnosis')
    )
    op.create_table('orders',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('id_child', sa.Integer(), nullable=False),
    sa.Column('id_parent', sa.Integer(), nullable=False),
    sa.Column('id_treatment_course', sa.Integer(), nullable=False),
    sa.Column('id_room', sa.Integer(), nullable=False),
    sa.Column('status', sa.String(length=255), nullable=False),
    sa.Column('check_in_date', sa.Date(), nullable=False),
    sa.Column('check_out_date', sa.Date(), nullable=False),
    sa.Column('price', sa.DECIMAL(precision=7, scale=2), nullable=False),
    sa.ForeignKeyConstraint(['id_child'], ['childs.id'], ),
    sa.ForeignKeyConstraint(['id_parent'], ['parents.id'], ),
    sa.ForeignKeyConstraint(['id_room'], ['rooms.id'], ),
    sa.ForeignKeyConstraint(['id_treatment_course'], ['treatment_courses.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('procedure_records',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('id_child', sa.Integer(), nullable=False),
    sa.Column('id_procedure', sa.Integer(), nullable=False),
    sa.Column('id_staff', sa.Integer(), nullable=False),
    sa.Column('procedure_time', sa.DateTime(), nullable=False),
    sa.ForeignKeyConstraint(['id_child'], ['childs.id'], ),
    sa.ForeignKeyConstraint(['id_procedure'], ['procedures.id'], ),
    sa.ForeignKeyConstraint(['id_staff'], ['staff.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('procedure_records')
    op.drop_table('orders')
    op.drop_table('child_diagnosis')
    op.drop_table('courses_procedures')
    op.drop_table('childs')
    op.drop_table('treatment_courses')
    op.drop_table('staff')
    op.drop_table('parents')
    op.drop_table('users')
    op.drop_table('rooms')
    op.drop_table('procedures')
    op.drop_table('diagnosis')
    # ### end Alembic commands ###
