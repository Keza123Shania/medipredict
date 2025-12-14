using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MediPredict.Migrations
{
    /// <inheritdoc />
    public partial class AddDoctorCredentialFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BoardCertifications",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EducationTraining",
                table: "Doctors",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LicenseExpiryDate",
                table: "Doctors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "LicenseIssueDate",
                table: "Doctors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LicenseState",
                table: "Doctors",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NpiNumber",
                table: "Doctors",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProfessionalTitle",
                table: "Doctors",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BoardCertifications",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "EducationTraining",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LicenseExpiryDate",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LicenseIssueDate",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "LicenseState",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "NpiNumber",
                table: "Doctors");

            migrationBuilder.DropColumn(
                name: "ProfessionalTitle",
                table: "Doctors");
        }
    }
}
