using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediPredict.Migrations
{
    /// <inheritdoc />
    public partial class RemoveUnnecessaryColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FollowUpDate",
                table: "ConsultationRecords");

            migrationBuilder.DropColumn(
                name: "FollowUpInstructions",
                table: "ConsultationRecords");

            migrationBuilder.DropColumn(
                name: "FollowUpRequired",
                table: "ConsultationRecords");

            migrationBuilder.DropColumn(
                name: "LabReports",
                table: "ConsultationRecords");

            migrationBuilder.DropColumn(
                name: "PatientRecordNotes",
                table: "ConsultationRecords");

            migrationBuilder.DropColumn(
                name: "SpecialistReferrals",
                table: "ConsultationRecords");

            migrationBuilder.DropColumn(
                name: "Diagnosis",
                table: "Appointments");

            migrationBuilder.DropColumn(
                name: "TreatmentPlan",
                table: "Appointments");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "FollowUpDate",
                table: "ConsultationRecords",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FollowUpInstructions",
                table: "ConsultationRecords",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "FollowUpRequired",
                table: "ConsultationRecords",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "LabReports",
                table: "ConsultationRecords",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PatientRecordNotes",
                table: "ConsultationRecords",
                type: "nvarchar(3000)",
                maxLength: 3000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SpecialistReferrals",
                table: "ConsultationRecords",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Diagnosis",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TreatmentPlan",
                table: "Appointments",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
